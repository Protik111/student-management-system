"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth-helpers";
import {
  ok,
  fail,
  writeAuditLog,
  getCurrentAcademicYear,
  type ActionResult,
} from "@/lib/actions/_helpers";
import { notify } from "@/lib/notifications";
import { csvImportRequestSchema, type CsvImportRequest } from "@/lib/actions/schemas";
import { generateStudentAdmissionNo } from "@/lib/sequences";

/* ─── Bulk CSV import ────────────────────────────────────────────────────── */

export interface ImportSummary {
  inserted: number;
  skipped: number;
  failed: number;
  errors: Array<{ row: number; email?: string; reason: string }>;
}

const ACADEMIC_YEAR = getCurrentAcademicYear();
const ACADEMIC_YEAR_NUM = new Date().getUTCFullYear();

/**
 * Bulk-import students from a parsed+validated CSV.
 *
 * `rows` should already have been parsed + Zod-validated client-side. This
 * action:
 *   1. Hashes a default password once
 *   2. Pre-checks for email collisions and existing admission numbers
 *   3. Resolves class by (name, section) within the actor's school
 *   4. Inserts in a single transaction, including audit + per-row notify
 *
 * Returns a summary so the UI can render a "X inserted, Z skipped" report.
 */
export async function importStudentsCsv(
  input: CsvImportRequest,
): Promise<ActionResult<ImportSummary>> {
  let actor;
  try {
    actor = await requirePermission("import_students");
  } catch {
    return fail("You don't have permission to import students");
  }
  if (actor.role !== "ADMIN" && !actor.schoolId) {
    return fail("You must be assigned to a school to import students");
  }
  const schoolId = actor.schoolId;
  if (!schoolId && actor.role !== "ADMIN") {
    return fail("No school context");
  }

  const parsed = csvImportRequestSchema.safeParse(input);
  if (!parsed.success) {
    const errs: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      (errs[key] ??= []).push(issue.message);
    }
    return fail("Invalid input", errs);
  }
  const { rows: validRows, defaultPassword, skipExisting } = parsed.data;
  const schoolIds = actor.role === "ADMIN"
    ? (await prisma.school.findMany({ select: { id: true } })).map((s) => s.id)
    : [schoolId as string];

  const passwordHash = await hash(defaultPassword, 10);

  // Pre-check: duplicate emails within the file
  const emails = validRows.map((r) => r.email);
  const dupEmails = emails.filter((e, i) => emails.indexOf(e) !== i);
  if (dupEmails.length) {
    return fail("Duplicate email in CSV: " + dupEmails.join(", "));
  }

  // Pre-check: emails already in DB (within the scope schools)
  const existingUsers = await prisma.user.findMany({
    where: { email: { in: emails }, schoolId: { in: schoolIds } },
    select: { email: true },
  });
  const existingEmails = new Set(existingUsers.map((u) => u.email));

  // Pre-check: existing admissionNos. Auto-generated: rows don't supply an
  // admissionNo, so this is always an empty set; the migration renumbered
  // everything to SMS-YYYY-####, and new rows are stamped inside the tx.
  const existingAdmissionNos = new Set<string>();

  // Resolve programmes by code (per target school)
  const programmeCodes = Array.from(
    new Set(
      validRows
        .map((r) => r.programmeCode)
        .filter((c): c is string => Boolean(c)),
    ),
  );
  const programmes = programmeCodes.length
    ? await prisma.programme.findMany({
        where: { schoolId: { in: schoolIds }, code: { in: programmeCodes } },
        select: { id: true, code: true, schoolId: true },
      })
    : [];
  const programmeByKey = new Map<string, { id: string; schoolId: string }>();
  for (const p of programmes) {
    programmeByKey.set(`${p.schoolId}|${p.code.toLowerCase()}`, p);
  }

  // Resolve classes by (name, section)
  const classKeys = new Set<string>();
  for (const r of validRows) {
    if (r.currentClassName) {
      classKeys.add(`${r.currentClassName.toLowerCase()}|${(r.currentClassSection || "A").toLowerCase()}`);
    }
  }
  const classes = await prisma.class.findMany({
    where: { schoolId: { in: schoolIds } },
    select: { id: true, name: true, section: true, schoolId: true },
  });
  const classByKey = new Map<string, { id: string; schoolId: string }>();
  for (const c of classes) {
    classByKey.set(`${c.name.toLowerCase()}|${c.section.toLowerCase()}`, {
      id: c.id,
      schoolId: c.schoolId,
    });
  }

  const summary: ImportSummary = {
    inserted: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  // Pick the actor's schoolId for school_admin; super_admin uses row's matched class's schoolId
  // but since we only allow ONE school per import here, we pick the most common matching
  // school. If the actor is super_admin and rows reference different schools, that's an error.
  let targetSchoolId: string;
  if (actor.role === "ADMIN") {
    targetSchoolId = schoolId as string;
  } else {
    // Find a class that matches any row, use that school; else fall back to first school.
    let firstClassSchoolId: string | null = null;
    for (const r of validRows) {
      if (!r.currentClassName) continue;
      const k = `${r.currentClassName.toLowerCase()}|${(r.currentClassSection || "A").toLowerCase()}`;
      const c = classByKey.get(k);
      if (c) {
        if (firstClassSchoolId && firstClassSchoolId !== c.schoolId) {
          return fail("CSV references classes in multiple schools — split the file by school");
        }
        firstClassSchoolId = c.schoolId;
      }
    }
    targetSchoolId = firstClassSchoolId ?? schoolIds[0];
  }

  await prisma.$transaction(async (tx) => {
    await writeAuditLog(tx, {
      actorId: actor.id,
      schoolId: targetSchoolId,
      action: "students.csv_import_start",
      entityType: "CsvImport",
      entityId: null,
      payload: { rowCount: validRows.length, defaultPasswordSet: true },
    });

    for (let i = 0; i < validRows.length; i++) {
      const r = validRows[i];
      const rowNo = i + 2; // +2 = data row, 1-indexed in spreadsheet

      try {
        if (existingEmails.has(r.email)) {
          if (skipExisting) {
            summary.skipped++;
            summary.errors.push({
              row: rowNo,
              email: r.email,
              reason: "Email already exists — skipped",
            });
            continue;
          }
          throw new Error("Email already exists");
        }
        // Admission numbers are auto-generated server-side; nothing to pre-check
        // for collisions. New rows get a fresh SMS-YYYY-#### inside the tx.

        // Resolve programme by code (per target school)
        let programmeId: string | null = null;
        if (r.programmeCode) {
          const k = `${targetSchoolId}|${r.programmeCode.toLowerCase()}`;
          const prog = programmeByKey.get(k);
          if (!prog) {
            throw new Error(
              `Programme "${r.programmeCode}" not found in the target school`,
            );
          }
          programmeId = prog.id;
        }

        // Resolve class
        let classId: string | null = null;
        if (r.currentClassName) {
          const k = `${r.currentClassName.toLowerCase()}|${(r.currentClassSection || "A").toLowerCase()}`;
          const cls = classByKey.get(k);
          if (!cls) {
            throw new Error(
              `Class "${r.currentClassName}-${r.currentClassSection || "A"}" not found in this school`,
            );
          }
          if (cls.schoolId !== targetSchoolId) {
            throw new Error(
              `Class "${r.currentClassName}-${r.currentClassSection || "A"}" is in a different school`,
            );
          }
          classId = cls.id;
        }

        const dob = r.dateOfBirth && r.dateOfBirth !== "" ? new Date(r.dateOfBirth + "T00:00:00.000Z") : null;

        // Auto-generate a per-school, per-year SMS-YYYY-#### id.
        const admissionNo = await generateStudentAdmissionNo(tx, targetSchoolId);

        const user = await tx.user.create({
          data: {
            id: crypto.randomUUID(),
            email: r.email,
            passwordHash,
            fullName: r.fullName,
            schoolId: targetSchoolId,
            primaryRole: "STUDENT",
            roles: {
              create: { role: "STUDENT", schoolId: targetSchoolId },
            },
          },
        });

        const student = await tx.student.create({
          data: {
            id: crypto.randomUUID(),
            userId: user.id,
            schoolId: targetSchoolId,
            admissionNo,
            dateOfBirth: dob,
            gender: r.gender,
            currentClassId: classId,
            programmeId,
            academicYear: r.academicYear ?? ACADEMIC_YEAR_NUM,
            guardianName: r.guardianName || null,
            guardianPhone: r.guardianPhone || null,
            address: r.address || null,
          },
        });

        if (classId) {
          await tx.enrollment.create({
            data: {
              studentId: student.id,
              classId,
              academicYear: ACADEMIC_YEAR,
              status: "enrolled",
            },
          });
        }

        await notify(tx, {
          recipientUserId: user.id,
          type: "user_created",
          title: "Welcome — your student account was created",
          body: `Sign in using your email and the temporary password you were given. Change it after first login.`,
          link: "/student",
        });

        await writeAuditLog(tx, {
          actorId: actor.id,
          schoolId: targetSchoolId,
          action: "students.create",
          entityType: "Student",
          entityId: student.id,
          payload: { email: r.email, admissionNo, programmeId, via: "csv_import" },
        });

        summary.inserted++;
      } catch (e) {
        summary.failed++;
        summary.errors.push({
          row: rowNo,
          email: r.email,
          reason: (e as Error).message,
        });
      }
    }

    await writeAuditLog(tx, {
      actorId: actor.id,
      schoolId: targetSchoolId,
      action: "students.csv_import_done",
      entityType: "CsvImport",
      entityId: null,
      payload: {
        inserted: summary.inserted,
        skipped: summary.skipped,
        failed: summary.failed,
      },
    });
  });

  revalidatePath("/admin/students");
  revalidatePath("/admin/audit");
  revalidatePath("/admin/audit");
  return ok(summary);
}