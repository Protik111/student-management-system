"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";
import { requirePermission, requireRole, requireUser } from "@/lib/auth-helpers";
import {
  ok,
  fail,
  writeAuditLog,
  type ActionResult,
} from "@/lib/actions/_helpers";
import { notify } from "@/lib/notifications";
import { readFormFile, saveUpload, validateUpload } from "@/lib/uploads";
import { classify as classifyScore } from "@/lib/grading";
import {
  assessmentCreateSchema,
  assessmentGradeInputSchema,
  type AssessmentCreateInput,
  type AssessmentGradeInput,
} from "@/lib/actions/schemas";
import type {
  AssessmentStatus,
  GradeClassification,
  SubmissionStatus,
} from "@prisma/client";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function flattenZod(err: import("zod").ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const path = issue.path.join(".") || "_";
    (out[path] ??= []).push(issue.message);
  }
  return out;
}

/* ─── List ───────────────────────────────────────────────────────────────── */

export interface AssessmentListItem {
  id: string;
  title: string;
  module: string;
  status: AssessmentStatus;
  deadline: Date;
  classId: string;
  className: string;
  classSection: string;
  subjectId: string;
  subjectName: string;
  teacherName: string;
  submissionCount: number;
  gradedCount: number;
  createdAt: Date;
}

export async function listAssessmentsForTeacher(): Promise<AssessmentListItem[]> {
  const actor = await requirePermission("manage_assessments");

  const where: Record<string, unknown> = {};
  if (actor.role !== "ADMIN" && actor.schoolId) {
    where.schoolId = actor.schoolId;
  } else if (actor.role === "TEACHER") {
    where.teacherId = actor.id;
  }

  const rows = await prisma.assessment.findMany({
    where,
    include: {
      class: { select: { id: true, name: true, section: true } },
      subject: { select: { id: true, name: true } },
      teacher: { include: { user: { select: { fullName: true } } } },
      submissions: { select: { id: true } },
      grades: { select: { id: true } },
    },
    orderBy: [{ deadline: "desc" }],
  });

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    module: r.module,
    status: r.status,
    deadline: r.deadline,
    classId: r.classId,
    className: r.class.name,
    classSection: r.class.section,
    subjectId: r.subjectId,
    subjectName: r.subject.name,
    teacherName: r.teacher.user.fullName,
    submissionCount: r.submissions.length,
    gradedCount: r.grades.length,
    createdAt: r.createdAt,
  }));
}

export async function listOpenAssessmentsForStudent(): Promise<AssessmentListItem[]> {
  const actor = await requireRole("STUDENT");
  const student = await prisma.student.findUnique({
    where: { userId: actor.id },
    select: { id: true, schoolId: true, currentClassId: true },
  });
  if (!student || !student.currentClassId) return [];

  const rows = await prisma.assessment.findMany({
    where: {
      classId: student.currentClassId,
      schoolId: student.schoolId,
      status: { in: ["open"] },
    },
    include: {
      class: { select: { id: true, name: true, section: true } },
      subject: { select: { id: true, name: true } },
      teacher: { include: { user: { select: { fullName: true } } } },
      submissions: { where: { studentId: student.id }, select: { id: true } },
      grades: { where: { studentId: student.id }, select: { id: true, published: true } },
    },
    orderBy: [{ deadline: "asc" }],
  });

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    module: r.module,
    status: r.status,
    deadline: r.deadline,
    classId: r.classId,
    className: r.class.name,
    classSection: r.class.section,
    subjectId: r.subjectId,
    subjectName: r.subject.name,
    teacherName: r.teacher.user.fullName,
    submissionCount: r.submissions.length,
    gradedCount: r.grades.length,
    createdAt: r.createdAt,
  }));
}

/* ─── Create ─────────────────────────────────────────────────────────────── */

export async function createAssessment(
  input: AssessmentCreateInput,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_assessments");
  } catch {
    return fail("You don't have permission to create assessments");
  }

  const parsed = assessmentCreateSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid input", flattenZod(parsed.error));
  const data = parsed.data as {
    classId: string;
    subjectId: string;
    title: string;
    module: string;
    description: string | undefined;
    deadline: Date | undefined;
    allowResub: boolean;
    lateAccepted: boolean;
    maxMarks: number;
  };

  const teacher = await prisma.teacher.findUnique({
    where: { userId: actor.id },
    select: { id: true, schoolId: true },
  });
  if (!teacher) return fail("Only teachers can create assessments");
  if (!data.deadline) return fail("Deadline is required", { deadline: ["Pick a date"] });

  // Class must be in same school as teacher
  const klass = await prisma.class.findUnique({
    where: { id: data.classId },
    select: { id: true, schoolId: true },
  });
  if (!klass || klass.schoolId !== teacher.schoolId) {
    return fail("Class is not in your school", { classId: ["Pick a class from your school"] });
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const a = await tx.assessment.create({
        data: {
          id: crypto.randomUUID(),
          schoolId: teacher.schoolId,
          classId: data.classId,
          subjectId: data.subjectId,
          teacherId: teacher.id,
          title: data.title,
          module: data.module,
          description: data.description ?? null,
          deadline: data.deadline!,
          allowResub: data.allowResub,
          lateAccepted: data.lateAccepted,
          maxMarks: data.maxMarks,
          status: "open",
        },
      });

      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: teacher.schoolId,
        action: "assessments.create",
        entityType: "Assessment",
        entityId: a.id,
        payload: {
          title: data.title,
          module: data.module,
          classId: data.classId,
          subjectId: data.subjectId,
          deadline: data.deadline,
        },
      });

      // Notify every student in the class
      const recipients = await tx.student.findMany({
        where: { currentClassId: data.classId, user: { isActive: true } },
        select: { userId: true },
      });
      for (const r of recipients) {
        await notify(tx, {
          recipientUserId: r.userId,
          type: "assessment_created",
          title: `New assessment: ${data.title}`,
          body: `${data.module} — due ${data.deadline!.toLocaleDateString()}.`,
          link: `/student/assessments/${a.id}`,
          payload: { assessmentId: a.id },
        });
      }
      return a;
    });

    revalidatePath("/teacher/assessments");
    revalidatePath("/student/assessments");
    return ok({ id: created.id });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't create assessment");
  }
}

/* ─── Submissions (student-side) ─────────────────────────────────────────── */

export interface SubmissionForTeacher {
  id: string;
  attempt: number;
  status: SubmissionStatus;
  isLate: boolean;
  fileUrl: string;
  fileName: string;
  fileBytes: number;
  submittedAt: Date;
  feedback: string | null;
  studentId: string;
  studentName: string;
  studentAdmissionNo: string;
  grade: {
    marksObtained: number;
    classification: GradeClassification;
    published: boolean;
    remarks: string | null;
  } | null;
}

export async function getAssessmentDetail(assessmentId: string) {
  const actor = await requirePermission("manage_assessments");
  const a = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      class: { select: { name: true, section: true, id: true } },
      subject: { select: { name: true } },
      teacher: { include: { user: { select: { fullName: true } } } },
    },
  });
  if (!a) return null;
  if (actor.role === "ADMIN" && a.schoolId !== actor.schoolId) return null;
  if (actor.role === "TEACHER" && a.teacherId !== (await prisma.teacher.findUnique({ where: { userId: actor.id } }))?.id) {
    // teacher must be the owner
    return null;
  }
  return a;
}

export async function listSubmissionsForAssessment(
  assessmentId: string,
): Promise<SubmissionForTeacher[]> {
  const actor = await requirePermission("manage_assessments");
  const a = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  if (!a) return [];
  if (actor.role === "ADMIN" && a.schoolId !== actor.schoolId) return [];
  if (actor.role === "TEACHER") {
    const t = await prisma.teacher.findUnique({ where: { userId: actor.id } });
    if (!t || a.teacherId !== t.id) return [];
  }

  const rows = await prisma.submission.findMany({
    where: { assessmentId },
    include: {
      student: { include: { user: { select: { fullName: true } } } },
      assessment: { select: { maxMarks: true } },
    },
    orderBy: [{ studentId: "asc" }, { attempt: "desc" }],
  });

  // For each student, we want the LATEST attempt + their grade
  const byStudent = new Map<string, typeof rows[number]>();
  for (const r of rows) {
    const cur = byStudent.get(r.studentId);
    if (!cur || r.attempt > cur.attempt) byStudent.set(r.studentId, r);
  }

  // Fetch grades
  const grades = await prisma.assessmentGrade.findMany({
    where: { assessmentId },
  });
  const gradeByStudent = new Map<string, (typeof grades)[number]>();
  for (const g of grades) gradeByStudent.set(g.studentId, g);

  return Array.from(byStudent.values()).map((r) => {
    const g = gradeByStudent.get(r.studentId);
    return {
      id: r.id,
      attempt: r.attempt,
      status: r.status,
      isLate: r.isLate,
      fileUrl: r.fileUrl,
      fileName: r.fileName,
      fileBytes: r.fileBytes,
      submittedAt: r.submittedAt,
      feedback: r.feedback,
      studentId: r.studentId,
      studentName: r.student.user.fullName,
      studentAdmissionNo: r.student.admissionNo,
      grade: g
        ? {
            marksObtained: g.marksObtained,
            classification: g.classification,
            published: g.published,
            remarks: g.remarks,
          }
        : null,
    };
  });
}

export async function submitWork(
  formData: FormData,
): Promise<ActionResult<{ submissionId: string; isLate: boolean; attempt: number }>> {
  const actor = await requireRole("STUDENT");
  const student = await prisma.student.findUnique({
    where: { userId: actor.id },
    select: { id: true, schoolId: true },
  });
  if (!student) return fail("Student profile not found");

  const assessmentId = String(formData.get("assessmentId") ?? "");
  if (!assessmentId) return fail("Assessment is required");

  const a = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  if (!a) return fail("Assessment not found");
  if (a.status !== "open") return fail("Assessment is no longer open");
  if (a.schoolId !== student.schoolId) return fail("Assessment is from another school");

  const file = await readFormFile(formData, "file");
  if (!file) return fail("Please choose a file to upload");

  let validated;
  try {
    validated = await validateUpload(file);
  } catch (e) {
    return fail((e as Error).message ?? "Invalid file");
  }

  // Late-flag & late-rejection
  const isLate = file.lastModified
    ? new Date(file.lastModified).getTime() > a.deadline.getTime()
    : new Date().getTime() > a.deadline.getTime();
  // For server-rendered FormData the lastModified is the upload time, which
  // is fine — use that as "now" for late comparison.
  const submittedAt = new Date();
  const lateByClock = submittedAt.getTime() > a.deadline.getTime();
  const isLateFinal = lateByClock || isLate;

  if (!a.lateAccepted && isLateFinal) {
    return fail(
      "This assessment doesn't accept late submissions and the deadline has passed.",
    );
  }

  // Find latest attempt
  const lastSubmission = await prisma.submission.findFirst({
    where: { assessmentId, studentId: student.id },
    orderBy: { attempt: "desc" },
  });

  if (lastSubmission && !a.allowResub && lastSubmission.status !== "returned") {
    return fail("Resubmissions are not allowed for this assessment");
  }

  const attempt = (lastSubmission?.attempt ?? 0) + 1;

  // Save file
  const fileUrl = await saveUpload(
    validated.bytes,
    validated.ext,
    "submissions",
    a.id,
  );

  try {
    const created = await prisma.$transaction(async (tx) => {
      const s = await tx.submission.create({
        data: {
          id: crypto.randomUUID(),
          assessmentId,
          studentId: student.id,
          fileUrl,
          fileName: file.name,
          fileBytes: file.size,
          mimeType: file.type || "application/octet-stream",
          attempt,
          status: isLateFinal ? "late" : attempt > 1 ? "resubmitted" : "submitted",
          isLate: isLateFinal,
        },
      });

      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: student.schoolId,
        action: "assessments.submission_create",
        entityType: "Submission",
        entityId: s.id,
        payload: {
          assessmentId,
          attempt,
          isLate: isLateFinal,
          fileName: file.name,
        },
      });

      // Notify the teacher (who created the assessment)
      const teacherUser = await tx.teacher.findUnique({
        where: { id: a.teacherId },
        select: { userId: true, user: { select: { fullName: true } } },
      });
      if (teacherUser) {
        await notify(tx, {
          recipientUserId: teacherUser.userId,
          type: isLateFinal ? "submission_late" : "submission_received",
          title: isLateFinal
            ? `Late submission: ${a.title}`
            : `New submission: ${a.title}`,
          body: `${teacherUser.user.fullName.split(" ")[0] ?? ""} got a submission (attempt ${attempt})${isLateFinal ? " — late" : ""}.`,
          link: `/teacher/assessments/${a.id}`,
          payload: { submissionId: s.id, attempt, isLate: isLateFinal },
        });
      }

      return s;
    });

    revalidatePath(`/teacher/assessments/${assessmentId}`);
    revalidatePath(`/student/assessments`);
    return ok({
      submissionId: created.id,
      isLate: created.isLate,
      attempt: created.attempt,
    });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't submit");
  }
}

/* ─── Grading ────────────────────────────────────────────────────────────── */

export async function enterOrUpdateGrade(
  input: AssessmentGradeInput,
): Promise<
  ActionResult<{ gradeId: string; classification: GradeClassification }>
> {
  let actor;
  try {
    actor = await requirePermission("manage_assessments");
  } catch {
    return fail("You don't have permission to grade");
  }

  const parsed = assessmentGradeInputSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid input", flattenZod(parsed.error));
  const data = parsed.data as {
    assessmentId: string;
    studentId: string;
    marksObtained: number;
    remarks: string | undefined;
  };

  const a = await prisma.assessment.findUnique({
    where: { id: data.assessmentId },
    select: { id: true, maxMarks: true, schoolId: true, teacherId: true },
  });
  if (!a) return fail("Assessment not found");
  if (actor.role === "ADMIN" && a.schoolId !== actor.schoolId) {
    return fail("Not your school's assessment");
  }
  if (actor.role === "TEACHER") {
    const t = await prisma.teacher.findUnique({ where: { userId: actor.id } });
    if (!t || a.teacherId !== t.id) return fail("Not your assessment");
  }

  if (data.marksObtained > a.maxMarks) {
    return fail(`Marks exceed the maximum of ${a.maxMarks}`, {
      marksObtained: [`Max ${a.maxMarks}`],
    });
  }

  const classification = classifyScore(data.marksObtained, a.maxMarks);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const grade = await tx.assessmentGrade.upsert({
        where: {
          assessmentId_studentId: {
            assessmentId: data.assessmentId,
            studentId: data.studentId,
          },
        },
        create: {
          id: crypto.randomUUID(),
          assessmentId: data.assessmentId,
          studentId: data.studentId,
          marksObtained: data.marksObtained,
          classification,
          remarks: data.remarks ?? null,
          enteredById: actor.id,
        },
        update: {
          marksObtained: data.marksObtained,
          classification,
          remarks: data.remarks ?? null,
        },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: a.schoolId,
        action: "assessments.grade_upsert",
        entityType: "AssessmentGrade",
        entityId: grade.id,
        payload: {
          studentId: data.studentId,
          marksObtained: data.marksObtained,
          classification,
        },
      });
      return grade;
    });

    revalidatePath(`/teacher/assessments/${data.assessmentId}`);
    return ok({ gradeId: result.id, classification: result.classification });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't save grade");
  }
}

export async function publishAssessmentGrade(
  assessmentId: string,
  studentId: string,
  publish: boolean,
): Promise<ActionResult<{ id: string; published: boolean }>> {
  let actor;
  try {
    actor = await requirePermission("publish_results");
  } catch {
    return fail("You don't have permission to publish results");
  }

  const grade = await prisma.assessmentGrade.findUnique({
    where: { assessmentId_studentId: { assessmentId, studentId } },
    include: { student: { select: { userId: true } }, assessment: true },
  });
  if (!grade) return fail("Grade not found — enter a grade first");
  if (actor.role === "ADMIN" && grade.assessment.schoolId !== actor.schoolId) {
    return fail("Not your school's assessment");
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const g = await tx.assessmentGrade.update({
        where: { id: grade.id },
        data: { published: publish, publishedAt: publish ? new Date() : null },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: grade.assessment.schoolId,
        action: publish ? "assessments.grade_publish" : "assessments.grade_withhold",
        entityType: "AssessmentGrade",
        entityId: g.id,
        payload: { studentId, assessmentId },
      });
      if (publish) {
        await notify(tx, {
          recipientUserId: grade.student.userId,
          type: "grades_published",
          title: "Grade published",
          body: `Your grade for "${grade.assessment.title}" is now visible.`,
          link: `/student/assessments/${grade.assessmentId}`,
          payload: { gradeId: g.id, assessmentId, marksObtained: g.marksObtained },
        });
      }
      return g;
    });
    revalidatePath(`/teacher/assessments/${assessmentId}`);
    return ok({ id: updated.id, published: updated.published });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't publish");
  }
}

export async function publishAllGradesForAssessment(
  assessmentId: string,
): Promise<ActionResult<{ count: number }>> {
  let actor;
  try {
    actor = await requirePermission("publish_results");
  } catch {
    return fail("You don't have permission to publish results");
  }
  const a = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  if (!a) return fail("Assessment not found");
  if (actor.role === "ADMIN" && a.schoolId !== actor.schoolId) {
    return fail("Not your school's assessment");
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const grades = await tx.assessmentGrade.findMany({
        where: { assessmentId, published: false },
        include: { student: { select: { userId: true } } },
      });
      if (grades.length === 0) return { count: 0 };
      const now = new Date();
      await tx.assessmentGrade.updateMany({
        where: { id: { in: grades.map((g) => g.id) } },
        data: { published: true, publishedAt: now },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: a.schoolId,
        action: "assessments.grade_publish_all",
        entityType: "Assessment",
        entityId: assessmentId,
        payload: { count: grades.length },
      });
      for (const g of grades) {
        await notify(tx, {
          recipientUserId: g.student.userId,
          type: "grades_published",
          title: "Grade published",
          body: `Your grade for "${a.title}" is now visible.`,
          link: `/student/assessments/${assessmentId}`,
          payload: { gradeId: g.id, assessmentId },
        });
      }
      return { count: grades.length };
    });
    revalidatePath(`/teacher/assessments/${assessmentId}`);
    return ok({ count: result.count });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't publish");
  }
}

/* ─── Student view ───────────────────────────────────────────────────────── */

export async function getStudentSubmissionForAssessment(assessmentId: string) {
  const actor = await requireUser();
  const student = await prisma.student.findUnique({
    where: { userId: actor.id },
    select: { id: true },
  });
  if (!student) return null;
  const [assessment, submissions, grade] = await Promise.all([
    prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        class: { select: { name: true, section: true } },
        subject: { select: { name: true } },
        teacher: { include: { user: { select: { fullName: true } } } },
      },
    }),
    prisma.submission.findMany({
      where: { assessmentId, studentId: student.id },
      orderBy: { attempt: "asc" },
    }),
    prisma.assessmentGrade.findUnique({
      where: { assessmentId_studentId: { assessmentId, studentId: student.id } },
    }),
  ]);
  if (!assessment) return null;
  return { assessment, submissions, grade };
}