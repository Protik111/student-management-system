import { notFound } from "next/navigation";

import { requirePermission } from "@/lib/auth-helpers";
import EnrollmentsList from "@/components/admin/students/EnrollmentsList";
import { prisma } from "@/lib/db/prisma";
import {
  listStudentEnrollments,
  type StudentListItem,
} from "@/lib/actions/students";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function loadStudent(id: string): Promise<StudentListItem | null> {
  const row = await prisma.student.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, fullName: true, phone: true, avatarUrl: true, isActive: true } },
      school: { select: { id: true, name: true } },
      currentClass: { select: { id: true, name: true, section: true } },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    userId: row.userId,
    admissionNo: row.admissionNo,
    fullName: row.user.fullName,
    email: row.user.email,
    phone: row.user.phone,
    avatarUrl: row.user.avatarUrl,
    isActive: row.user.isActive,
    dateOfBirth: row.dateOfBirth,
    gender: row.gender,
    guardianName: row.guardianName,
    guardianPhone: row.guardianPhone,
    schoolId: row.schoolId,
    schoolName: row.school.name,
    currentClassId: row.currentClassId,
    currentClassName: row.currentClass
      ? `${row.currentClass.name}-${row.currentClass.section}`
      : null,
    createdAt: row.createdAt,
  };
}

export const metadata = { title: "Enrollments · Super Admin" };

export default async function SuperAdminStudentEnrollmentsPage({
  params,
}: PageProps) {
  await requirePermission("manage_students");
  const { id } = await params;
  const [student, enrollments] = await Promise.all([
    loadStudent(id),
    listStudentEnrollments(id),
  ]);
  if (!student) notFound();

  return (
    <EnrollmentsList
      variant="super_admin"
      student={student}
      enrollments={enrollments}
    />
  );
}