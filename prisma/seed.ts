/* eslint-disable no-console */
/**
 * Seed script. Run via `npm run db:seed`.
 *
 * Creates a super admin, one demo school, and one user per remaining role
 * (school admin, teacher, student) so you can immediately exercise every
 * dashboard. Idempotent — safe to re-run.
 */
import bcrypt from "bcryptjs";

import { prisma } from "../lib/db/prisma";

const DEMO_PASSWORD = "admin123";
const ACADEMIC_YEAR = "2025-2026";

async function main() {
  console.log("🌱 Seeding SMS database…");

  // ─── 1. School ────────────────────────────────────────────────────────
  const school = await prisma.school.upsert({
    where: { id: "school_demo_001" },
    update: {},
    create: {
      id: "school_demo_001",
      name: "Sunrise Academy",
      address: "12 Education Lane, Dhaka",
      contactEmail: "info@sunriseacademy.edu",
      contactPhone: "+880 1700 000000",
    },
  });
  console.log(`  ✓ school: ${school.name} (${school.id})`);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ─── 2. Users + UserRoles ─────────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@sms.local" },
    update: {},
    create: {
      id: "user_super_admin",
      schoolId: null,
      email: "admin@sms.local",
      passwordHash,
      fullName: "Sadia Rahman",
      primaryRole: "super_admin",
    },
  });
  await prisma.userRole.upsert({
    where: { userId_role: { userId: superAdmin.id, role: "super_admin" } },
    update: {},
    create: { userId: superAdmin.id, role: "super_admin", schoolId: null },
  });

  const schoolAdmin = await prisma.user.upsert({
    where: { email: "school.admin@sms.local" },
    update: {},
    create: {
      id: "user_school_admin",
      schoolId: school.id,
      email: "school.admin@sms.local",
      passwordHash,
      fullName: "Mahmud Hossain",
      phone: "+880 1711 111111",
      primaryRole: "school_admin",
    },
  });
  await prisma.userRole.upsert({
    where: { userId_role: { userId: schoolAdmin.id, role: "school_admin" } },
    update: {},
    create: { userId: schoolAdmin.id, role: "school_admin", schoolId: school.id },
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@sms.local" },
    update: {},
    create: {
      id: "user_teacher_1",
      schoolId: school.id,
      email: "teacher@sms.local",
      passwordHash,
      fullName: "Ayesha Siddiqua",
      phone: "+880 1722 222222",
      primaryRole: "teacher",
    },
  });
  await prisma.userRole.upsert({
    where: { userId_role: { userId: teacherUser.id, role: "teacher" } },
    update: {},
    create: { userId: teacherUser.id, role: "teacher", schoolId: school.id },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: "student@sms.local" },
    update: {},
    create: {
      id: "user_student_1",
      schoolId: school.id,
      email: "student@sms.local",
      passwordHash,
      fullName: "Rahim Ahmed",
      phone: "+880 1733 333333",
      primaryRole: "student",
    },
  });
  await prisma.userRole.upsert({
    where: { userId_role: { userId: studentUser.id, role: "student" } },
    update: {},
    create: { userId: studentUser.id, role: "student", schoolId: school.id },
  });

  console.log("  ✓ users: 4 (super admin, school admin, teacher, student)");

  // ─── 3. Teacher record ────────────────────────────────────────────────
  const teacher = await prisma.teacher.upsert({
    where: { id: "teacher_1" },
    update: {},
    create: {
      id: "teacher_1",
      userId: teacherUser.id,
      schoolId: school.id,
      employeeId: "EMP-001",
      qualification: "M.Sc. in Mathematics",
      specialization: "Algebra & Calculus",
      salary: 4500000, // 45,000.00 in cents
    },
  });
  console.log(`  ✓ teacher record: ${teacher.employeeId}`);

  // ─── 4. Class ─────────────────────────────────────────────────────────
  const klass = await prisma.class.upsert({
    where: { id: "class_grade10_a" },
    update: {},
    create: {
      id: "class_grade10_a",
      schoolId: school.id,
      name: "Grade 10",
      gradeLevel: 10,
      section: "A",
      capacity: 40,
      classTeacherId: teacher.id,
      academicYear: ACADEMIC_YEAR,
    },
  });
  console.log(`  ✓ class: ${klass.name} - ${klass.section}`);

  // ─── 5. Subject + class-subject mapping ───────────────────────────────
  const subject = await prisma.subject.upsert({
    where: { id: "subject_math_101" },
    update: {},
    create: {
      id: "subject_math_101",
      schoolId: school.id,
      name: "Mathematics",
      code: "MATH-101",
      description: "Algebra, geometry, and basic calculus.",
    },
  });
  console.log(`  ✓ subject: ${subject.name}`);

  await prisma.classSubject.upsert({
    where: { id: "cs_grade10_math" },
    update: {},
    create: {
      id: "cs_grade10_math",
      classId: klass.id,
      subjectId: subject.id,
      teacherId: teacher.id,
      periodsPerWeek: 5,
    },
  });
  console.log("  ✓ class-subject: Grade 10 - Mathematics (5 periods/week)");

  // ─── 6. Student record + enrollment ──────────────────────────────────
  const student = await prisma.student.upsert({
    where: { id: "student_1" },
    update: {},
    create: {
      id: "student_1",
      userId: studentUser.id,
      schoolId: school.id,
      admissionNo: "ADM-2025-001",
      dateOfBirth: new Date("2009-05-15"),
      gender: "male",
      currentClassId: klass.id,
      guardianName: "Karim Ahmed",
      guardianPhone: "+880 1744 444444",
      address: "House 4, Road 7, Dhaka",
    },
  });

  // Enrollments don't have a stable id we control in the Drizzle version;
  // upsert on the (studentId, classId, academicYear) unique index.
  await prisma.enrollment.upsert({
    where: {
      studentId_classId_academicYear: {
        studentId: student.id,
        classId: klass.id,
        academicYear: ACADEMIC_YEAR,
      },
    },
    update: {},
    create: {
      studentId: student.id,
      classId: klass.id,
      academicYear: ACADEMIC_YEAR,
      status: "active",
    },
  });
  console.log(`  ✓ student record: ${student.admissionNo} enrolled in Grade 10-A`);

  // ─── 7. Library book ──────────────────────────────────────────────────
  const book = await prisma.book.upsert({
    where: { id: "book_1" },
    update: {},
    create: {
      id: "book_1",
      schoolId: school.id,
      title: "Higher Mathematics — Class 10",
      author: "Dr. Shahjahan Tapan",
      isbn: "978-984-0000-001",
      totalCopies: 25,
      availableCopies: 25,
      shelfLocation: "A-12",
      category: "Textbook",
    },
  });
  console.log(`  ✓ book: ${book.title} (${book.totalCopies} copies)`);

  console.log("\n✅ Seed complete. Demo credentials:");
  console.log("    super admin  →  admin@sms.local         / admin123");
  console.log("    school admin →  school.admin@sms.local  / admin123");
  console.log("    teacher      →  teacher@sms.local       / admin123");
  console.log("    student      →  student@sms.local       / admin123\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error("❌ Seed failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  });