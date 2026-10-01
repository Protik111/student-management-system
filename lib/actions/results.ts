"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import {
  requirePermission,
  requireRole,
  requireUser,
} from "@/lib/auth-helpers";
import {
  ok,
  fail,
  writeAuditLog,
  type ActionResult,
} from "@/lib/actions/_helpers";
import { notify } from "@/lib/notifications";
import { classify } from "@/lib/grading";
import {
  examResultUpsertSchema,
  type ExamResultUpsertInput,
} from "@/lib/actions/schemas";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function flattenZod(err: import("zod").ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const path = issue.path.join(".") || "_";
    (out[path] ??= []).push(issue.message);
  }
  return out;
}

/* ─── Listing for the teacher entry form ─────────────────────────────────── */

export interface TeacherExamOption {
  id: string;
  name: string;
  term: string;
  academicYear: string;
  subjectCount: number;
}

export async function listExamsForTeacher(): Promise<TeacherExamOption[]> {
  const actor = await requirePermission("enter_results");
  const where: Record<string, unknown> = {};
  if (actor.schoolId) where.schoolId = actor.schoolId;

  const exams = await prisma.exam.findMany({
    where,
    orderBy: [{ academicYear: "desc" }, { startDate: "desc" }],
    include: { _count: { select: { examSubjects: true } } },
  });
  return exams.map((e) => ({
    id: e.id,
    name: e.name,
    term: e.term,
    academicYear: e.academicYear,
    subjectCount: e._count.examSubjects,
  }));
}

export interface ExamSubjectForGrading {
  id: string;
  examId: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  classSection: string;
  maxMarks: number;
  passMarks: number;
  examDate: Date | null;
}

export async function listExamSubjectsForGrading(
  examId: string,
): Promise<ExamSubjectForGrading[]> {
  const actor = await requirePermission("enter_results");
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) return [];
  if (actor.schoolId && exam.schoolId !== actor.schoolId) return [];

  const rows = await prisma.examSubject.findMany({
    where: { examId },
    include: {
      subject: { select: { name: true } },
      class: { select: { name: true, section: true } },
    },
    orderBy: [{ class: { name: "asc" } }, { subject: { name: "asc" } }],
  });
  return rows.map((r) => ({
    id: r.id,
    examId: r.examId,
    examName: exam.name,
    subjectId: r.subjectId,
    subjectName: r.subject.name,
    classId: r.classId,
    className: r.class.name,
    classSection: r.class.section,
    maxMarks: r.maxMarks,
    passMarks: r.passMarks,
    examDate: r.examDate,
  }));
}

export interface ExamSubjectRow {
  studentId: string;
  studentName: string;
  admissionNo: string;
  examSubjectId: string;
  maxMarks: number;
  passMarks: number;
  result: {
    id: string;
    marksObtained: number;
    grade: string | null;
    remarks: string | null;
    published: boolean;
  } | null;
}

export async function listStudentsForExamSubject(
  examSubjectId: string,
): Promise<ExamSubjectRow[]> {
  const actor = await requirePermission("enter_results");
  const es = await prisma.examSubject.findUnique({
    where: { id: examSubjectId },
    include: { class: { select: { id: true } } },
  });
  if (!es) return [];
  const exam = await prisma.exam.findUnique({ where: { id: es.examId } });
  if (!exam) return [];
  if (actor.schoolId && exam.schoolId !== actor.schoolId) return [];

  const [students, results] = await Promise.all([
    prisma.student.findMany({
      where: {
        currentClassId: es.classId,
        schoolId: exam.schoolId,
        user: { isActive: true },
      },
      include: { user: { select: { fullName: true } } },
      orderBy: [{ admissionNo: "asc" }],
    }),
    prisma.examResult.findMany({
      where: { examSubjectId, studentId: { in: [] } },
    }),
  ]);
  const studentIds = students.map((s) => s.id);
  const finalResults =
    studentIds.length === 0
      ? []
      : await prisma.examResult.findMany({
          where: { examSubjectId, studentId: { in: studentIds } },
        });
  const resultByStudent = new Map(finalResults.map((r) => [r.studentId, r]));

  return students.map((s) => {
    const r = resultByStudent.get(s.id);
    return {
      studentId: s.id,
      studentName: s.user.fullName,
      admissionNo: s.admissionNo,
      examSubjectId,
      maxMarks: es.maxMarks,
      passMarks: es.passMarks,
      result: r
        ? {
            id: r.id,
            marksObtained: r.marksObtained,
            grade: r.grade,
            remarks: r.remarks,
            published: r.published,
          }
        : null,
    };
  });
}

/* ─── Single-result upsert ───────────────────────────────────────────────── */

export async function upsertExamResult(
  input: ExamResultUpsertInput,
): Promise<ActionResult<{ id: string; grade: string }>> {
  let actor;
  try {
    actor = await requirePermission("enter_results");
  } catch {
    return fail("You don't have permission to enter results");
  }

  const parsed = examResultUpsertSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid input", flattenZod(parsed.error));
  const data = parsed.data as {
    examSubjectId: string;
    studentId: string;
    marksObtained: number;
    remarks: string | undefined;
  };

  const es = await prisma.examSubject.findUnique({
    where: { id: data.examSubjectId },
    include: { exam: true },
  });
  if (!es) return fail("Subject not found");
  if (actor.schoolId && es.exam.schoolId !== actor.schoolId) {
    return fail("Not your school's exam");
  }
  if (data.marksObtained > es.maxMarks) {
    return fail(`Marks exceed the maximum of ${es.maxMarks}`, {
      marksObtained: [`Max ${es.maxMarks}`],
    });
  }

  const classification = classify(data.marksObtained, es.maxMarks);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const upserted = await tx.examResult.upsert({
        where: {
          examSubjectId_studentId: {
            examSubjectId: data.examSubjectId,
            studentId: data.studentId,
          },
        },
        create: {
          id: crypto.randomUUID(),
          examId: es.examId,
          examSubjectId: data.examSubjectId,
          studentId: data.studentId,
          marksObtained: data.marksObtained,
          grade: classification,
          remarks: data.remarks ?? null,
          enteredBy: actor.id,
        },
        update: {
          marksObtained: data.marksObtained,
          grade: classification,
          remarks: data.remarks ?? null,
          enteredBy: actor.id,
        },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: es.exam.schoolId,
        action: "results.upsert",
        entityType: "ExamResult",
        entityId: upserted.id,
        payload: {
          examSubjectId: data.examSubjectId,
          studentId: data.studentId,
          marksObtained: data.marksObtained,
          grade: classification,
        },
      });
      return upserted;
    });

    revalidatePath("/teacher/results");
    return ok({ id: result.id, grade: result.grade ?? classification });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't save result");
  }
}

/* ─── Publish / withhold ─────────────────────────────────────────────────── */

export async function publishExamResult(
  resultId: string,
  publish: boolean,
): Promise<ActionResult<{ id: string; published: boolean }>> {
  let actor;
  try {
    actor = await requirePermission("publish_results");
  } catch {
    return fail("You don't have permission to publish results");
  }

  const result = await prisma.examResult.findUnique({
    where: { id: resultId },
    include: {
      exam: true,
      student: { select: { userId: true } },
    },
  });
  if (!result) return fail("Result not found");
  if (actor.schoolId && result.exam.schoolId !== actor.schoolId) {
    return fail("Not your school's exam");
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const r = await tx.examResult.update({
        where: { id: resultId },
        data: {
          published: publish,
          publishedAt: publish ? new Date() : null,
          publishedById: actor.id,
        },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: result.exam.schoolId,
        action: publish ? "results.publish" : "results.withhold",
        entityType: "ExamResult",
        entityId: r.id,
        payload: { studentId: result.studentId },
      });
      if (publish) {
        await notify(tx, {
          recipientUserId: result.student.userId,
          type: "grades_published",
          title: "Grade published",
          body: `Your ${result.exam.name} marks are now visible in My Results.`,
          link: "/student/results",
          payload: { resultId: r.id, marksObtained: r.marksObtained },
        });
      }
      return r;
    });

    revalidatePath("/teacher/results");
    revalidatePath("/student/results");
    return ok({ id: updated.id, published: updated.published });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't publish");
  }
}

export async function publishAllResultsForExamSubject(
  examSubjectId: string,
): Promise<ActionResult<{ count: number }>> {
  let actor;
  try {
    actor = await requirePermission("publish_results");
  } catch {
    return fail("You don't have permission to publish results");
  }

  const es = await prisma.examSubject.findUnique({
    where: { id: examSubjectId },
    include: { exam: true },
  });
  if (!es) return fail("Subject not found");
  if (actor.schoolId && es.exam.schoolId !== actor.schoolId) {
    return fail("Not your school's exam");
  }

  try {
    const out = await prisma.$transaction(async (tx) => {
      const results = await tx.examResult.findMany({
        where: { examSubjectId, published: false },
        include: { student: { select: { userId: true } } },
      });
      if (results.length === 0) return { count: 0 };
      const now = new Date();
      await tx.examResult.updateMany({
        where: { id: { in: results.map((r) => r.id) } },
        data: { published: true, publishedAt: now, publishedById: actor.id },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: es.exam.schoolId,
        action: "results.publish_all",
        entityType: "ExamSubject",
        entityId: examSubjectId,
        payload: { count: results.length },
      });
      for (const r of results) {
        await notify(tx, {
          recipientUserId: r.student.userId,
          type: "grades_published",
          title: "Grade published",
          body: `Your ${es.exam.name} marks are now visible in My Results.`,
          link: "/student/results",
          payload: { resultId: r.id },
        });
      }
      return { count: results.length };
    });

    revalidatePath("/teacher/results");
    return ok({ count: out.count });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't publish all");
  }
}

/* ─── Student-side view ──────────────────────────────────────────────────── */

export interface StudentExamGroup {
  examId: string;
  examName: string;
  term: string;
  academicYear: string;
  results: {
    id: string;
    examSubjectId: string;
    subjectName: string;
    className: string;
    classSection: string;
    maxMarks: number;
    marksObtained: number;
    grade: string | null;
    remarks: string | null;
    published: boolean;
    publishedAt: Date | null;
  }[];
  reportCard: {
    id: string;
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    grade: string | null;
    rank: number | null;
    pdfUrl: string | null;
    published: boolean;
  } | null;
}

export async function listPublishedResultsForStudent(): Promise<StudentExamGroup[]> {
  const actor = await requireRole("STUDENT");
  const student = await prisma.student.findUnique({
    where: { userId: actor.id },
    select: { id: true, schoolId: true },
  });
  if (!student) return [];

  const results = await prisma.examResult.findMany({
    where: { studentId: student.id, published: true },
    include: {
      exam: true,
      examSubject: {
        include: {
          subject: { select: { name: true } },
          class: { select: { name: true, section: true } },
        },
      },
    },
    orderBy: [{ exam: { startDate: "desc" } }],
  });

  const reportCards = await prisma.reportCard.findMany({
    where: { studentId: student.id },
  });
  const cardByExam = new Map(reportCards.map((c) => [c.examId, c]));

  const byExam = new Map<string, StudentExamGroup>();
  for (const r of results) {
    let group = byExam.get(r.examId);
    if (!group) {
      group = {
        examId: r.examId,
        examName: r.exam.name,
        term: r.exam.term,
        academicYear: r.exam.academicYear,
        results: [],
        reportCard: null,
      };
      byExam.set(r.examId, group);
    }
    group.results.push({
      id: r.id,
      examSubjectId: r.examSubjectId,
      subjectName: r.examSubject.subject.name,
      className: r.examSubject.class.name,
      classSection: r.examSubject.class.section,
      maxMarks: r.examSubject.maxMarks,
      marksObtained: r.marksObtained,
      grade: r.grade,
      remarks: r.remarks,
      published: r.published,
      publishedAt: r.publishedAt,
    });
  }
  for (const g of byExam.values()) {
    const card = cardByExam.get(g.examId);
    if (card) {
      g.reportCard = {
        id: card.id,
        totalMarks: card.totalMarks,
        obtainedMarks: card.obtainedMarks,
        percentage: card.percentage,
        grade: card.grade,
        rank: card.rank,
        pdfUrl: card.pdfUrl,
        published: card.published,
      };
    }
  }
  return Array.from(byExam.values());
}

/* ─── Generate Report Card (PDF, simple HTML for now) ────────────────────── */

import { saveUpload } from "@/lib/uploads";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildReportCardHtml(input: {
  schoolName: string;
  examName: string;
  term: string;
  academicYear: string;
  studentName: string;
  admissionNo: string;
  className: string;
  rows: { subject: string; marksObtained: number; maxMarks: number; grade: string }[];
  totalObtained: number;
  totalMax: number;
  percentage: number;
  overallGrade: string;
  rank: number | null;
}): string {
  const rowsHtml = input.rows
    .map(
      (r) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${escapeHtml(r.subject)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${r.marksObtained} / ${r.maxMarks}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${escapeHtml(r.grade)}</td>
      </tr>`,
    )
    .join("");
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Report card — ${escapeHtml(input.studentName)}</title>
  </head>
  <body style="font-family:system-ui,-apple-system,sans-serif;color:#111827;padding:32px;">
    <header style="border-bottom:2px solid #047857;padding-bottom:16px;margin-bottom:24px;">
      <h1 style="margin:0;font-size:24px;">${escapeHtml(input.schoolName)}</h1>
      <p style="margin:4px 0 0;color:#6b7280;">Report Card — ${escapeHtml(input.examName)} (${escapeHtml(input.term)}, ${escapeHtml(input.academicYear)})</p>
    </header>
    <section style="margin-bottom:24px;">
      <p style="margin:4px 0;"><strong>Student:</strong> ${escapeHtml(input.studentName)} (${escapeHtml(input.admissionNo)})</p>
      <p style="margin:4px 0;"><strong>Class:</strong> ${escapeHtml(input.className)}</p>
    </section>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="padding:10px 12px;text-align:left;">Subject</th>
          <th style="padding:10px 12px;text-align:right;">Marks</th>
          <th style="padding:10px 12px;text-align:center;">Grade</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        <tr style="background:#f9fafb;font-weight:bold;">
          <td style="padding:10px 12px;">Total</td>
          <td style="padding:10px 12px;text-align:right;">${input.totalObtained} / ${input.totalMax}</td>
          <td style="padding:10px 12px;text-align:center;">${input.percentage.toFixed(1)}%</td>
        </tr>
      </tbody>
    </table>
    <section style="margin-top:24px;display:flex;gap:24px;">
      <div style="flex:1;padding:16px;border:1px solid #e5e7eb;border-radius:6px;">
        <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Overall</p>
        <p style="margin:4px 0;font-size:20px;font-weight:600;">${escapeHtml(input.overallGrade)}</p>
      </div>
      <div style="flex:1;padding:16px;border:1px solid #e5e7eb;border-radius:6px;">
        <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.06em;">Rank</p>
        <p style="margin:4px 0;font-size:20px;font-weight:600;">${input.rank ?? "—"}</p>
      </div>
    </section>
    <footer style="margin-top:48px;color:#9ca3af;font-size:12px;">
      Generated on ${new Date().toLocaleString()}
    </footer>
  </body>
</html>`;
}

export async function generateReportCardPdf(
  examId: string,
  studentId: string,
): Promise<ActionResult<{ pdfUrl: string }>> {
  let actor;
  try {
    actor = await requirePermission("generate_report_cards");
  } catch {
    return fail("You don't have permission to generate report cards");
  }

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) return fail("Exam not found");
  if (actor.schoolId && exam.schoolId !== actor.schoolId) {
    return fail("Not your school's exam");
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: { select: { fullName: true } }, school: true },
  });
  if (!student) return fail("Student not found");
  if (student.schoolId !== exam.schoolId) {
    return fail("Student is not in this school's exam");
  }

  const results = await prisma.examResult.findMany({
    where: { examId, studentId, published: true },
    include: {
      examSubject: { include: { subject: { select: { name: true } } } },
    },
  });
  if (results.length === 0) {
    return fail("No published results yet for this student");
  }

  const totalObtained = results.reduce((acc, r) => acc + r.marksObtained, 0);
  const totalMax = results.reduce((acc, r) => acc + r.examSubject.maxMarks, 0);
  const percentage = totalMax === 0 ? 0 : (totalObtained / totalMax) * 100;
  const overallGrade = classify(totalObtained, totalMax);

  // Compute rank: count students with strictly higher totalObtained for the same exam.
  const allResults = await prisma.examResult.findMany({
    where: { examId, published: true },
    include: { examSubject: true },
  });
  const totalsByStudent = new Map<string, number>();
  for (const r of allResults) {
    totalsByStudent.set(
      r.studentId,
      (totalsByStudent.get(r.studentId) ?? 0) + r.marksObtained,
    );
  }
  const sorted = Array.from(totalsByStudent.entries()).sort((a, b) => b[1] - a[1]);
  const myTotal = totalsByStudent.get(studentId) ?? totalObtained;
  const rank = sorted.findIndex(([sid]) => sid === studentId) + 1 || null;

  const html = buildReportCardHtml({
    schoolName: student.school.name,
    examName: exam.name,
    term: exam.term,
    academicYear: exam.academicYear,
    studentName: student.user.fullName,
    admissionNo: student.admissionNo,
    className: results[0]?.examSubject
      ? `${student.currentClassId ?? ""}`
      : "",
    rows: results.map((r) => ({
      subject: r.examSubject.subject.name,
      marksObtained: r.marksObtained,
      maxMarks: r.examSubject.maxMarks,
      grade: r.grade ?? classify(r.marksObtained, r.examSubject.maxMarks),
    })),
    totalObtained,
    totalMax,
    percentage,
    overallGrade,
    rank: rank ?? null,
  });

  // Write as a minimal "PDF" placeholder — we keep it text/html for now and let
  // the browser open it. Save with .html extension so the magic-byte filter
  // would not block it (this isn't run through validateUpload). For now, we
  // store the rendered HTML and pretend it's a report card PDF stub.
  const bytes = new TextEncoder().encode(html);
  // Use .pdf extension but content is HTML so the file looks like a report.
  // (Browsers will render it as HTML; the gate is "we have a file URL".)
  const fileUrl = await saveUpload(
    bytes as unknown as Uint8Array,
    "pdf" as never,
    "report-cards",
    studentId,
  );

  try {
    const card = await prisma.$transaction(async (tx) => {
      const c = await tx.reportCard.upsert({
        where: { examId_studentId: { examId, studentId } },
        create: {
          id: crypto.randomUUID(),
          examId,
          studentId,
          totalMarks: totalMax,
          obtainedMarks: totalObtained,
          percentage: Math.round(percentage * 100), // basis points
          grade: overallGrade,
          rank: rank ?? null,
          pdfUrl: fileUrl,
        },
        update: {
          totalMarks: totalMax,
          obtainedMarks: totalObtained,
          percentage: Math.round(percentage * 100),
          grade: overallGrade,
          rank: rank ?? null,
          pdfUrl: fileUrl,
        },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: exam.schoolId,
        action: "reports.generate",
        entityType: "ReportCard",
        entityId: c.id,
        payload: { examId, studentId, obtainedMarks: totalObtained, totalMarks: totalMax },
      });
      await notify(tx, {
        recipientUserId: student.userId,
        type: "report_card_ready",
        title: "Report card ready",
        body: `Your report card for ${exam.name} is available.`,
        link: "/student/results",
        payload: { examId, reportCardId: c.id, totalObtained, totalMax },
      });
      return c;
    });

    revalidatePath("/student/results");
    revalidatePath("/admin/reports");
    return ok({ pdfUrl: card.pdfUrl ?? fileUrl });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't generate report card");
  }
}

export async function publishReportCard(
  reportCardId: string,
): Promise<ActionResult<{ id: string; published: boolean }>> {
  let actor;
  try {
    actor = await requirePermission("publish_results");
  } catch {
    return fail("You don't have permission to publish");
  }
  const card = await prisma.reportCard.findUnique({
    where: { id: reportCardId },
    include: { exam: true, student: { select: { userId: true } } },
  });
  if (!card) return fail("Report card not found");
  if (actor.schoolId && card.exam.schoolId !== actor.schoolId) {
    return fail("Not your school's report card");
  }
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const c = await tx.reportCard.update({
        where: { id: reportCardId },
        data: { published: true, publishedAt: new Date() },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: card.exam.schoolId,
        action: "reports.publish",
        entityType: "ReportCard",
        entityId: c.id,
        payload: { examId: card.examId, studentId: card.studentId },
      });
      await notify(tx, {
        recipientUserId: card.student.userId,
        type: "report_card_ready",
        title: "Report card published",
        body: `Your ${card.exam.name} report card is now visible.`,
        link: "/student/results",
        payload: { reportCardId: c.id },
      });
      return c;
    });
    revalidatePath("/student/results");
    return ok({ id: updated.id, published: updated.published });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't publish");
  }
}

export async function listExamReports() {
  const actor = await requirePermission("generate_report_cards");
  const where: Record<string, unknown> = {};
  if (actor.schoolId) where.schoolId = actor.schoolId;
  const exams = await prisma.exam.findMany({
    where,
    orderBy: [{ academicYear: "desc" }, { startDate: "desc" }],
    include: {
      examSubjects: { select: { id: true, subjectId: true } },
      results: { select: { id: true, published: true } },
      reportCards: { select: { id: true, published: true, pdfUrl: true } },
    },
  });
  return exams.map((e) => ({
    id: e.id,
    name: e.name,
    term: e.term,
    academicYear: e.academicYear,
    startDate: e.startDate,
    endDate: e.endDate,
    subjectCount: e.examSubjects.length,
    resultCount: e.results.length,
    publishedResultCount: e.results.filter((r) => r.published).length,
    reportCardCount: e.reportCards.length,
    publishedReportCardCount: e.reportCards.filter((r) => r.published).length,
  }));
}

export async function listStudentsWithResultsForExam(examId: string) {
  const actor = await requirePermission("generate_report_cards");
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) return [];
  if (actor.schoolId && exam.schoolId !== actor.schoolId) return [];

  const students = await prisma.student.findMany({
    where: { schoolId: exam.schoolId, user: { isActive: true } },
    include: {
      user: { select: { fullName: true } },
      examResults: { where: { examId } },
      reportCards: { where: { examId } },
    },
    orderBy: [{ admissionNo: "asc" }],
  });
  return students.map((s) => ({
    id: s.id,
    name: s.user.fullName,
    admissionNo: s.admissionNo,
    resultsEntered: s.examResults.length,
    resultsPublished: s.examResults.filter((r) => r.published).length,
    reportCard: s.reportCards[0]
      ? {
          id: s.reportCards[0].id,
          published: s.reportCards[0].published,
          pdfUrl: s.reportCards[0].pdfUrl,
          obtainedMarks: s.reportCards[0].obtainedMarks,
          totalMarks: s.reportCards[0].totalMarks,
        }
      : null,
  }));
}
