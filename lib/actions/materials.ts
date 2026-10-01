"use server";

import { revalidatePath } from "next/cache";
import { unlink } from "node:fs/promises";
import path from "node:path";

import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth-helpers";
import {
  ok,
  fail,
  writeAuditLog,
  type ActionResult,
} from "@/lib/actions/_helpers";
import {
  readFormFile,
  saveUpload,
  validateUpload,
  UploadValidationError,
} from "@/lib/uploads";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface MaterialListItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileBytes: number;
  mimeType: string;
  uploadedByName: string;
  createdAt: Date;
}

/* ─── listMaterialsForCourse ─────────────────────────────────────────────── */

export async function listMaterialsForCourse(
  courseId: string,
): Promise<MaterialListItem[]> {
  let actor;
  try {
    actor = await requirePermission("view_course_materials");
  } catch {
    return [];
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      schoolId: true,
      teacherId: true,
      isActive: true,
    },
  });
  if (!course) return [];
  if (actor.schoolId && course.schoolId !== actor.schoolId) return [];

  // STUDENT gating: must be enrolled and course active.
  if (actor.role === "STUDENT") {
    if (!course.isActive) return [];
    const student = await prisma.student.findUnique({
      where: { userId: actor.id },
      select: { id: true },
    });
    if (!student) return [];
    const enr = await prisma.courseEnrollment.findUnique({
      where: { studentId_courseId: { studentId: student.id, courseId } },
      select: { id: true },
    });
    if (!enr) return [];
  } else if (actor.role === "TEACHER") {
    const teacherRow = await prisma.teacher.findUnique({
      where: { userId: actor.id },
      select: { id: true },
    });
    if (!teacherRow || teacherRow.id !== course.teacherId) {
      // Teachers only see materials for their own courses.
      return [];
    }
  }

  const rows = await prisma.material.findMany({
    where: { courseId },
    orderBy: { createdAt: "desc" },
    include: {
      uploadedBy: { select: { fullName: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    fileName: r.fileName,
    fileUrl: r.fileUrl,
    fileBytes: r.fileBytes,
    mimeType: r.mimeType,
    uploadedByName: r.uploadedBy.fullName,
    createdAt: r.createdAt,
  }));
}

/* ─── uploadMaterial ─────────────────────────────────────────────────────── */

export async function uploadMaterial(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_materials");
  } catch {
    return fail("You don't have permission to upload materials");
  }

  const courseId = (formData.get("courseId") as string | null) ?? "";
  if (!courseId) return fail("Course id is required");

  const file = await readFormFile(formData, "file");
  if (!file) return fail("Please choose a file to upload");

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      schoolId: true,
      teacherId: true,
      isActive: true,
      title: true,
    },
  });
  if (!course) return fail("Course not found");
  if (actor.schoolId && course.schoolId !== actor.schoolId) {
    return fail("Course is in a different school");
  }

  if (actor.role === "TEACHER") {
    const teacherRow = await prisma.teacher.findUnique({
      where: { userId: actor.id },
      select: { id: true },
    });
    if (!teacherRow || teacherRow.id !== course.teacherId) {
      return fail("You can only upload materials to courses you teach");
    }
  }

  let validatedUpload: Awaited<ReturnType<typeof validateUpload>>;
  try {
    validatedUpload = await validateUpload(file);
  } catch (e) {
    if (e instanceof UploadValidationError) {
      return fail(e.message);
    }
    return fail((e as Error).message ?? "Upload failed");
  }

  let fileUrl: string;
  try {
    fileUrl = await saveUpload(
      validatedUpload.bytes,
      validatedUpload.ext,
      "materials",
      courseId,
    );
  } catch (e) {
    return fail(
      (e as Error).message ?? "Couldn't save the file to disk",
    );
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      const row = await tx.material.create({
        data: {
          schoolId: course.schoolId,
          courseId,
          uploadedById: actor.id,
          fileUrl,
          fileName: file.name,
          fileBytes: file.size,
          mimeType: file.type || "application/octet-stream",
        },
        select: { id: true, createdAt: true },
      });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: actor.schoolId,
        action: "material.upload",
        entityType: "material",
        entityId: row.id,
        payload: { courseId, fileName: file.name },
      });
      return row;
    });

    // Notify enrolled students (best effort).
    try {
      const enrolled = await prisma.courseEnrollment.findMany({
        where: { courseId },
        select: { student: { select: { userId: true } } },
      });
      const recipientIds = enrolled
        .map((e) => e.student.userId)
        .filter(Boolean);
      if (recipientIds.length) {
        await prisma.notification.createMany({
          data: recipientIds.map((uid) => ({
            id: crypto.randomUUID(),
            recipientUserId: uid,
            type: "material_uploaded" as const,
            title: `New material in "${course.title}"`,
            body: `${actor.fullName} uploaded "${file.name}".`,
            link: `/student/courses/${courseId}`,
            payload: JSON.stringify({ courseId, materialId: created.id }),
          })),
        });
      }
    } catch {
      /* notification fanout is best-effort */
    }

    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath(`/teacher/courses/${courseId}`);
    revalidatePath(`/student/courses/${courseId}`);
    return ok({ id: created.id });
  } catch (e) {
    // Roll back the on-disk file if the DB insert failed.
    try {
      await unlink(path.join(process.cwd(), "public", fileUrl));
    } catch {
      /* ignore */
    }
    return fail((e as Error).message ?? "Couldn't record upload");
  }
}

/* ─── deleteMaterial ─────────────────────────────────────────────────────── */

export async function deleteMaterial(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  let actor;
  try {
    actor = await requirePermission("manage_materials");
  } catch {
    return fail("You don't have permission to delete materials");
  }

  const material = await prisma.material.findUnique({
    where: { id },
    select: {
      id: true,
      schoolId: true,
      courseId: true,
      uploadedById: true,
      fileUrl: true,
      course: { select: { teacherId: true } },
    },
  });
  if (!material) return fail("Material not found");
  if (material.schoolId !== actor.schoolId) {
    return fail("Material is in a different school");
  }

  const isAdmin = actor.role === "ADMIN";
  const isOwner = material.uploadedById === actor.id;
  const isCourseTeacher =
    actor.role === "TEACHER" &&
    (await prisma.teacher.findUnique({
      where: { userId: actor.id },
      select: { id: true },
    }))?.id === material.course.teacherId;

  if (!isAdmin && !(isOwner && isCourseTeacher)) {
    return fail("You can only delete materials you uploaded yourself");
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.material.delete({ where: { id } });
      await writeAuditLog(tx, {
        actorId: actor.id,
        schoolId: actor.schoolId,
        action: "material.delete",
        entityType: "material",
        entityId: id,
        payload: null,
      });
    });
  } catch (e) {
    return fail((e as Error).message ?? "Couldn't delete material");
  }

  // Best-effort disk cleanup.
  try {
    await unlink(path.join(process.cwd(), "public", material.fileUrl));
  } catch {
    /* ignore */
  }

  revalidatePath(`/admin/courses/${material.courseId}`);
  revalidatePath(`/teacher/courses/${material.courseId}`);
  revalidatePath(`/student/courses/${material.courseId}`);
  return ok({ id });
}