/**
 * Integration test for programme-based fee structures + invoice auto-derive.
 *
 * Cases:
 *   1. `createFeeStructure` accepts programmeId and persists it.
 *   2. `createInvoice` auto-derives amountCents from the student's programme
 *      when no explicit feeStructureId is given.
 *   3. When the student has no programmeId and no feeStructureId, the action
 *      refuses (no amount to bill).
 */
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: async () => ({
    user: {
      id: "actor_school_admin_1",
      email: "actor@test.local",
      name: "Test School Admin",
      fullName: "Test School Admin",
      role: "ADMIN",
      schoolId: "school_test_1",
      roles: ["ADMIN"],
    },
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: () => {},
  revalidateTag: () => {},
}));

import {
  prisma,
  resetTestDb,
  seedFixtures,
} from "../setup";

import { createFeeStructure, createInvoice } from "@/lib/actions/fees";
import { createStudent } from "@/lib/actions/students";
import type { StudentCreateFormInput } from "@/lib/actions/schemas";

type FormInput = StudentCreateFormInput;

let schoolId: string;
let programmeId: string;

beforeEach(async () => {
  await resetTestDb();
  const fixtures = await seedFixtures();
  schoolId = fixtures.school.id;
  programmeId = fixtures.programme.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

async function createStudentInTest(programmeId: string): Promise<string> {
  const input: FormInput = {
    email: `student-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.local`,
    fullName: "Test Student",
    password: "supersecret123",
    schoolId,
    primaryRole: "STUDENT",
    roles: ["STUDENT"],
    programmeId,
    academicYear: 2025,
    enrollInCurrentClass: false,
    gender: "male",
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = await createStudent(input as any);
  if (!r.ok) throw new Error("createStudent failed: " + r.error);
  return r.data.id;
}

describe("programme-based fees", () => {
  it("createFeeStructure accepts and persists programmeId", async () => {
    const result = await createFeeStructure({
      name: "Term 1 Tuition",
      programmeId,
      amountCents: 300000,
      frequency: "termly",
      isActive: true,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const fs = await prisma.feeStructure.findUnique({
      where: { id: result.data.id },
    });
    expect(fs?.programmeId).toBe(programmeId);
    expect(fs?.amountCents).toBe(300000);
  });

  it("createInvoice auto-derives amountCents from the student's programme", async () => {
    // Create a fee structure attached to the programme.
    const fsRes = await createFeeStructure({
      name: "Annual Tuition",
      programmeId,
      amountCents: 250000,
      frequency: "annual",
      isActive: true,
    });
    expect(fsRes.ok).toBe(true);
    if (!fsRes.ok) return;

    // Create a student on that programme.
    const studentId = await createStudentInTest(programmeId);

    // Issue an invoice with NO feeStructureId and NO amountCents. The
    // action must auto-derive 250000 from the programme's active fee.
    const invRes = await createInvoice({
      studentId,
      description: "",
      amountCents: 0,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    } as never);
    expect(invRes.ok).toBe(true);
    if (!invRes.ok) return;

    const inv = await prisma.invoice.findUnique({
      where: { id: invRes.data.id },
    });
    expect(inv?.amountCents).toBe(250000);
    expect(inv?.feeStructureId).toBe(fsRes.data.id);
    expect(inv?.studentId).toBe(studentId);
  });

  it("createInvoice fails when no fee structure is derivable", async () => {
    // Student without a programme (skip programmeId), no fee structure
    // attached to anything → action should reject.
    const input: FormInput = {
      email: `student-no-prog-${Date.now()}@test.local`,
      fullName: "No Programme Student",
      password: "supersecret123",
      schoolId,
      primaryRole: "STUDENT",
      roles: ["STUDENT"],
      programmeId, // we keep this required for createStudent, but...
      academicYear: 2025,
      enrollInCurrentClass: false,
      gender: "female",
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sr = await createStudent(input as any);
    expect(sr.ok).toBe(true);
    if (!sr.ok) return;

    // Manually clear programmeId to simulate a student without a programme.
    await prisma.student.update({
      where: { id: sr.data.id },
      data: { programmeId: null },
    });

    const invRes = await createInvoice({
      studentId: sr.data.id,
      description: "",
      amountCents: 0,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    } as never);
    expect(invRes.ok).toBe(false);
    if (invRes.ok) return;
    expect(invRes.error).toMatch(/amount is required|could not auto-derive/i);
  });
});