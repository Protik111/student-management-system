-- =============================================================================
-- Phase 1: Role collapse + new course/enrollment/material domain
-- =============================================================================
-- Postgres cannot drop or modify enum values that are in use. To collapse the
-- old {super_admin, school_admin, teacher, student} enum into the new
-- {ADMIN, TEACHER, STUDENT}, we:
--   1. Convert the affected columns to TEXT.
--   2. UPDATE the data so both admin tiers become 'ADMIN'.
--   3. DROP the old enum TYPE and CREATE a new one matching the Prisma schema.
--   4. Convert the columns back to the new enum.
-- All steps run inside the same transaction to preserve consistency.

BEGIN;

-- Step 1: convert Role-typed columns to plain TEXT (and any default)
ALTER TABLE "User"     ALTER COLUMN "primaryRole" DROP DEFAULT;
ALTER TABLE "UserRole" ALTER COLUMN "role"        DROP DEFAULT;

ALTER TABLE "User"     ALTER COLUMN "primaryRole" TYPE TEXT USING "primaryRole"::TEXT;
ALTER TABLE "UserRole" ALTER COLUMN "role"        TYPE TEXT USING "role"::TEXT;

-- Drop the old enum
DROP TYPE "Role";

-- Create the new enum matching the Prisma schema
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');

-- Step 2: collapse old role labels AND uppercase the remaining ones so they
-- match the new enum ('ADMIN', 'TEACHER', 'STUDENT').
UPDATE "User"     SET "primaryRole" = 'ADMIN'   WHERE "primaryRole" IN ('super_admin', 'school_admin');
UPDATE "UserRole" SET "role"        = 'ADMIN'   WHERE "role"        IN ('super_admin', 'school_admin');
UPDATE "User"     SET "primaryRole" = UPPER("primaryRole") WHERE "primaryRole" IN ('teacher', 'student');
UPDATE "UserRole" SET "role"        = UPPER("role")        WHERE "role"        IN ('teacher', 'student');

-- Step 3: re-cast columns to the new enum (validation fails if any label is invalid)
ALTER TABLE "User"     ALTER COLUMN "primaryRole" TYPE "Role" USING "primaryRole"::"Role";
ALTER TABLE "UserRole" ALTER COLUMN "role"        TYPE "Role" USING "role"::"Role";

-- =============================================================================
-- NotificationType: append the three new variants
-- =============================================================================
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'course_enrolled';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'course_added';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'material_uploaded';

-- =============================================================================
-- EnrollmentSource: new enum
-- =============================================================================
CREATE TYPE "EnrollmentSource" AS ENUM ('enrolled', 'added');

-- =============================================================================
-- Category table
-- =============================================================================
CREATE TABLE "Category" (
    "id"          TEXT NOT NULL,
    "schoolId"    TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "code"        TEXT NOT NULL,
    "description" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Category_schoolId_code_key" ON "Category"("schoolId", "code");
CREATE INDEX "Category_schoolId_idx"             ON "Category"("schoolId");
ALTER TABLE "Category" ADD CONSTRAINT "Category_schoolId_fkey"
    FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =============================================================================
-- Course table
-- =============================================================================
CREATE TABLE "Course" (
    "id"          TEXT NOT NULL,
    "schoolId"    TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId"  TEXT NOT NULL,
    "priceCents"  INTEGER NOT NULL DEFAULT 0,
    "teacherId"   TEXT NOT NULL,
    "isActive"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Course_schoolId_idx"    ON "Course"("schoolId");
CREATE INDEX "Course_teacherId_idx"   ON "Course"("teacherId");
CREATE INDEX "Course_categoryId_idx"  ON "Course"("categoryId");
CREATE INDEX "Course_isActive_idx"    ON "Course"("isActive");
ALTER TABLE "Course" ADD CONSTRAINT "Course_schoolId_fkey"
    FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Course" ADD CONSTRAINT "Course_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Course" ADD CONSTRAINT "Course_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================================================
-- CourseEnrollment table
-- =============================================================================
CREATE TABLE "CourseEnrollment" (
    "id"         TEXT NOT NULL,
    "studentId"  TEXT NOT NULL,
    "courseId"   TEXT NOT NULL,
    "source"     "EnrollmentSource" NOT NULL DEFAULT 'enrolled',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CourseEnrollment_studentId_courseId_key" ON "CourseEnrollment"("studentId", "courseId");
CREATE INDEX "CourseEnrollment_courseId_idx"  ON "CourseEnrollment"("courseId");
CREATE INDEX "CourseEnrollment_studentId_idx" ON "CourseEnrollment"("studentId");
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =============================================================================
-- Material table
-- =============================================================================
CREATE TABLE "Material" (
    "id"           TEXT NOT NULL,
    "schoolId"     TEXT NOT NULL,
    "courseId"     TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "fileUrl"      TEXT NOT NULL,
    "fileName"     TEXT NOT NULL,
    "fileBytes"    INTEGER NOT NULL,
    "mimeType"     TEXT NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Material_courseId_idx"     ON "Material"("courseId");
CREATE INDEX "Material_schoolId_idx"     ON "Material"("schoolId");
CREATE INDEX "Material_uploadedById_idx" ON "Material"("uploadedById");
ALTER TABLE "Material" ADD CONSTRAINT "Material_schoolId_fkey"
    FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Material" ADD CONSTRAINT "Material_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Material" ADD CONSTRAINT "Material_uploadedById_fkey"
    FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;