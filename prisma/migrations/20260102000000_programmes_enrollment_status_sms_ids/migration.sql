-- =============================================================================
-- Phase 2: Programmes, EnrollmentStatus rewrite, SMS-YYYY-#### admissionNo
-- =============================================================================
-- This migration aligns the schema with the PEN Global PDF requirements:
--   * A `Programme` model (degree / track) is added and Student/FeeStructure
--     gain an optional `programmeId` FK.
--   * The `EnrollmentStatus` enum is rewritten to the brief's four values
--     (enrolled / deferred / withdrawn / completed), with a data mapping from
--     the old four.
--   * `Student.admissionNo` is renumbered to `SMS-YYYY-####` per school, per
--     year, ordered by `createdAt`. Old ADM-... values are gone.
--
-- The whole script runs in a single transaction. Postgres can't drop or
-- modify enum values that are in use, so we follow the same TEXT → UPDATE →
-- DROP TYPE → CREATE TYPE → CAST pattern that the previous migration used
-- for `Role`.

BEGIN;

-- =============================================================================
-- 1. Programme table
-- =============================================================================
CREATE TABLE "Programme" (
    "id"            TEXT NOT NULL,
    "schoolId"      TEXT NOT NULL,
    "name"          TEXT NOT NULL,
    "code"          TEXT NOT NULL,
    "durationYears" INTEGER NOT NULL DEFAULT 4,
    "isActive"      BOOLEAN NOT NULL DEFAULT true,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Programme_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Programme_schoolId_code_key" ON "Programme"("schoolId", "code");
CREATE INDEX       "Programme_schoolId_idx"     ON "Programme"("schoolId");
ALTER TABLE "Programme" ADD CONSTRAINT "Programme_schoolId_fkey"
    FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: one programme per school. Subsequent inserts (via the admin UI
-- or the seed) will use real codes/names; this just gives every existing
-- Student and FeeStructure something valid to point at.
INSERT INTO "Programme" ("id", "schoolId", "name", "code", "durationYears", "isActive", "updatedAt")
SELECT
    'prog_' || "id" || '_general',
    "id",
    'General Studies',
    'GEN',
    4,
    true,
    CURRENT_TIMESTAMP
FROM "School"
ON CONFLICT ("schoolId", "code") DO NOTHING;

-- =============================================================================
-- 2. Add Student.programmeId + Student.academicYear (nullable initially)
-- =============================================================================
ALTER TABLE "Student" ADD COLUMN "programmeId"  TEXT;
ALTER TABLE "Student" ADD COLUMN "academicYear" INTEGER;

UPDATE "Student" s
SET "programmeId" = p."id"
FROM "Programme" p
WHERE p."schoolId" = s."schoolId"
  AND p."code"     = 'GEN'
  AND s."programmeId" IS NULL;

UPDATE "Student"
SET "academicYear" = 2025
WHERE "academicYear" IS NULL;

ALTER TABLE "Student" ADD CONSTRAINT "Student_programmeId_fkey"
    FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Student_programmeId_idx" ON "Student"("programmeId");

-- =============================================================================
-- 3. Add FeeStructure.programmeId (nullable for back-compat)
-- =============================================================================
ALTER TABLE "FeeStructure" ADD COLUMN "programmeId" TEXT;

UPDATE "FeeStructure" f
SET "programmeId" = p."id"
FROM "Programme" p
WHERE p."schoolId" = f."schoolId"
  AND p."code"     = 'GEN'
  AND f."programmeId" IS NULL;

ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_programmeId_fkey"
    FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "FeeStructure_programmeId_idx" ON "FeeStructure"("programmeId");

-- =============================================================================
-- 4. Rewrite EnrollmentStatus enum
-- =============================================================================
-- Convert the column to plain TEXT (and any default) so we can DROP the old
-- enum. The UPDATE below maps old values onto the brief's four values.
ALTER TABLE "Enrollment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Enrollment" ALTER COLUMN "status" TYPE TEXT USING "status"::TEXT;

DROP TYPE "EnrollmentStatus";

CREATE TYPE "EnrollmentStatus" AS ENUM (
    'enrolled',
    'deferred',
    'withdrawn',
    'completed'
);

-- Mapping:
--   active      → enrolled
--   graduated   → completed
--   transferred → withdrawn
--   dropped     → withdrawn
UPDATE "Enrollment" SET "status" = 'enrolled'  WHERE "status" = 'active';
UPDATE "Enrollment" SET "status" = 'completed' WHERE "status" = 'graduated';
UPDATE "Enrollment" SET "status" = 'withdrawn' WHERE "status" IN ('transferred', 'dropped');

ALTER TABLE "Enrollment"
    ALTER COLUMN "status" TYPE "EnrollmentStatus" USING "status"::"EnrollmentStatus";
ALTER TABLE "Enrollment"
    ALTER COLUMN "status" SET DEFAULT 'enrolled';

-- =============================================================================
-- 5. Renumber Student.admissionNo to SMS-YYYY-####
-- =============================================================================
-- Compute per-school, per-year sequence numbers via ROW_NUMBER() and stamp
-- them onto a temp table. Then UPDATE the Student table from that. We do
-- this in two steps so the (schoolId, admissionNo) unique index never sees
-- a duplicate — the temp table never conflicts with the live rows.
--
-- The numbering uses the calendar year (UTC). Existing rows get year 2025;
-- future inserts use the year at insert time.
CREATE TEMP TABLE "_AdmissionRenumber" (
    "id"           TEXT NOT NULL,
    "newAdmissionNo" TEXT NOT NULL,
    PRIMARY KEY ("id")
);

INSERT INTO "_AdmissionRenumber" ("id", "newAdmissionNo")
SELECT
    "id",
    'SMS-' || 2025 || '-' || lpad(seq::TEXT, 4, '0')
FROM (
    SELECT
        "id",
        ROW_NUMBER() OVER (PARTITION BY "schoolId" ORDER BY "createdAt", "id") AS seq
    FROM "Student"
) ranked;

UPDATE "Student" s
SET "admissionNo" = r."newAdmissionNo"
FROM "_AdmissionRenumber" r
WHERE s."id" = r."id";

DROP TABLE "_AdmissionRenumber";

COMMIT;