/* eslint-disable no-console */
/**
 * Seed script. Run via `npm run db:seed`.
 *
 * Creates a super admin, one demo school, and one user per remaining role
 * (school admin, teacher, student) so you can immediately exercise every
 * dashboard. Idempotent — safe to re-run.
 */
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";

import { db } from "./index";
import {
  schools,
  users,
  userRoles,
  students,
  teachers,
  classes,
  subjects,
  books,
  classSubjects,
  enrollments,
  type Role,
} from "./schema";

const DEMO_PASSWORD = "admin123";
const ACADEMIC_YEAR = "2025-2026";

async function main() {
  console.log("🌱 Seeding SMS database…");

  // ─── 1. School ────────────────────────────────────────────────────────
  const schoolId = await upsertSchool({
    id: "school_demo_001",
    name: "Sunrise Academy",
    address: "12 Education Lane, Dhaka",
    contactEmail: "info@sunriseacademy.edu",
    contactPhone: "+880 1700 000000",
    logoUrl: null,
  });
  console.log(`  ✓ school: Sunrise Academy (${schoolId})`);

  // ─── 2. Users ─────────────────────────────────────────────────────────
  const superAdminId = await upsertUser({
    id: "user_super_admin",
    schoolId: null,
    email: "admin@sms.local",
    password: DEMO_PASSWORD,
    fullName: "Sadia Rahman",
    phone: null,
    avatarUrl: null,
    primaryRole: "super_admin",
  });
  await ensureRole(superAdminId, "super_admin", null);

  const schoolAdminId = await upsertUser({
    id: "user_school_admin",
    schoolId,
    email: "school.admin@sms.local",
    password: DEMO_PASSWORD,
    fullName: "Mahmud Hossain",
    phone: "+880 1711 111111",
    primaryRole: "school_admin",
  });
  await ensureRole(schoolAdminId, "school_admin", schoolId);

  const teacherUserId = await upsertUser({
    id: "user_teacher_1",
    schoolId,
    email: "teacher@sms.local",
    password: DEMO_PASSWORD,
    fullName: "Ayesha Siddiqua",
    phone: "+880 1722 222222",
    primaryRole: "teacher",
  });
  await ensureRole(teacherUserId, "teacher", schoolId);

  const studentUserId = await upsertUser({
    id: "user_student_1",
    schoolId,
    email: "student@sms.local",
    password: DEMO_PASSWORD,
    fullName: "Rahim Ahmed",
    phone: "+880 1733 333333",
    primaryRole: "student",
  });
  await ensureRole(studentUserId, "student", schoolId);

  console.log("  ✓ users: 4 (super admin, school admin, teacher, student)");

  // ─── 3. Teacher record ────────────────────────────────────────────────
  const teacherId = "teacher_1";
  const existingTeacher = db
    .select()
    .from(teachers)
    .where(eq(teachers.userId, teacherUserId))
    .get();
  if (!existingTeacher) {
    db.insert(teachers)
      .values({
        id: teacherId,
        userId: teacherUserId,
        schoolId,
        employeeId: "EMP-001",
        qualification: "M.Sc. in Mathematics",
        specialization: "Algebra & Calculus",
        salary: 4500000, // 45,000.00 in cents
      })
      .run();
    console.log("  ✓ teacher record: EMP-001");
  }

  // ─── 4. Class ─────────────────────────────────────────────────────────
  const classId = "class_grade10_a";
  const existingClass = db.select().from(classes).where(eq(classes.id, classId)).get();
  if (!existingClass) {
    db.insert(classes)
      .values({
        id: classId,
        schoolId,
        name: "Grade 10",
        gradeLevel: 10,
        section: "A",
        capacity: 40,
        classTeacherId: teacherId,
        academicYear: ACADEMIC_YEAR,
      })
      .run();
    console.log("  ✓ class: Grade 10 - A");
  }

  // ─── 5. Subject + class-subject mapping ───────────────────────────────
  const subjectId = "subject_math_101";
  const existingSubject = db.select().from(subjects).where(eq(subjects.id, subjectId)).get();
  if (!existingSubject) {
    db.insert(subjects)
      .values({
        id: subjectId,
        schoolId,
        name: "Mathematics",
        code: "MATH-101",
        description: "Algebra, geometry, and basic calculus.",
      })
      .run();
    console.log("  ✓ subject: Mathematics");
  }

  const csId = "cs_grade10_math";
  const existingCS = db
    .select()
    .from(classSubjects)
    .where(eq(classSubjects.id, csId))
    .get();
  if (!existingCS) {
    db.insert(classSubjects)
      .values({
        id: csId,
        classId,
        subjectId,
        teacherId,
        periodsPerWeek: 5,
      })
      .run();
    console.log("  ✓ class-subject: Grade 10 - Mathematics (5 periods/week)");
  }

  // ─── 6. Student record + enrollment ──────────────────────────────────
  const studentId = "student_1";
  const existingStudent = db
    .select()
    .from(students)
    .where(eq(students.userId, studentUserId))
    .get();
  if (!existingStudent) {
    db.insert(students)
      .values({
        id: studentId,
        userId: studentUserId,
        schoolId,
        admissionNo: "ADM-2025-001",
        dateOfBirth: new Date("2009-05-15"),
        gender: "male",
        currentClassId: classId,
        guardianName: "Karim Ahmed",
        guardianPhone: "+880 1744 444444",
        address: "House 4, Road 7, Dhaka",
      })
      .run();

    db.insert(enrollments)
      .values({
        id: randomUUID(),
        studentId,
        classId,
        academicYear: ACADEMIC_YEAR,
        status: "active",
      })
      .run();
    console.log("  ✓ student record: ADM-2025-001 enrolled in Grade 10-A");
  }

  // ─── 7. Library book ──────────────────────────────────────────────────
  const bookId = "book_1";
  const existingBook = db.select().from(books).where(eq(books.id, bookId)).get();
  if (!existingBook) {
    db.insert(books)
      .values({
        id: bookId,
        schoolId,
        title: "Higher Mathematics — Class 10",
        author: "Dr. Shahjahan Tapan",
        isbn: "978-984-0000-001",
        totalCopies: 25,
        availableCopies: 25,
        shelfLocation: "A-12",
        category: "Textbook",
      })
      .run();
    console.log("  ✓ book: Higher Mathematics — Class 10 (25 copies)");
  }

  console.log("\n✅ Seed complete. Demo credentials:");
  console.log("    super admin  →  admin@sms.local         / admin123");
  console.log("    school admin →  school.admin@sms.local  / admin123");
  console.log("    teacher      →  teacher@sms.local       / admin123");
  console.log("    student      →  student@sms.local       / admin123\n");
}

/* ─────────────── helpers ─────────────── */

async function upsertSchool(row: {
  id: string;
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl: string | null;
}): Promise<string> {
  const existing = db.select().from(schools).where(eq(schools.id, row.id)).get();
  if (existing) return existing.id;
  db.insert(schools).values(row).run();
  return row.id;
}

async function upsertUser(row: {
  id: string;
  schoolId: string | null;
  email: string;
  password: string;
  fullName: string;
  phone: string | null;
  avatarUrl?: string | null;
  primaryRole: Role;
}): Promise<string> {
  const existing = db.select().from(users).where(eq(users.email, row.email)).get();
  if (existing) return existing.id;
  const passwordHash = await bcrypt.hash(row.password, 10);
  db.insert(users)
    .values({
      id: row.id,
      schoolId: row.schoolId,
      email: row.email,
      passwordHash,
      fullName: row.fullName,
      phone: row.phone,
      avatarUrl: row.avatarUrl ?? null,
      primaryRole: row.primaryRole,
    })
    .run();
  return row.id;
}

async function ensureRole(userId: string, role: Role, schoolId: string | null): Promise<void> {
  const existing = db
    .select()
    .from(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.role, role)))
    .get();
  if (existing) return;
  db.insert(userRoles).values({ userId, role, schoolId }).run();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
