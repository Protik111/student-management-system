/**
 * Integration test for the `createProgramme` server action.
 *
 * Cases:
 *   1. Happy path — creates Programme + audit log.
 *   2. Duplicate code within the same school → rejected pre-write.
 *   3. Cross-school guard — a programme whose schoolId is not the actor's
 *      (super-admin path) is rejected.
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

import { createProgramme } from "@/lib/actions/programmes";

let schoolId: string;
let otherSchoolId: string;

beforeEach(async () => {
  await resetTestDb();
  const fixtures = await seedFixtures();
  schoolId = fixtures.school.id;
  otherSchoolId = fixtures.otherSchool.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("createProgramme", () => {
  it("creates a programme + audit row", async () => {
    const result = await createProgramme({
      name: "BSc Computer Science",
      code: "BSC-CS",
      durationYears: 4,
      isActive: true,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const prog = await prisma.programme.findUnique({
      where: { id: result.data.id },
    });
    expect(prog).toBeTruthy();
    expect(prog?.code).toBe("BSC-CS");
    expect(prog?.schoolId).toBe(schoolId);
    expect(prog?.isActive).toBe(true);

    const audits = await prisma.auditLog.findMany({
      where: { entityId: result.data.id },
    });
    expect(audits).toHaveLength(1);
    expect(audits[0]?.action).toBe("programmes.create");
    expect(audits[0]?.schoolId).toBe(schoolId);
  });

  it("rejects a duplicate code within the same school", async () => {
    const first = await createProgramme({
      name: "BSc Physics",
      code: "BSC-PHY",
      durationYears: 4,
      isActive: true,
    });
    expect(first.ok).toBe(true);

    const second = await createProgramme({
      name: "BSc Physics (alt)",
      code: "BSC-PHY", // collision
      durationYears: 4,
      isActive: true,
    });
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.error).toMatch(/code already in use/i);
  });

  it("rejects cross-school programme assignment (school_admin)", async () => {
    // The actor is school_admin scoped to schoolId; trying to create in
    // otherSchoolId must be rejected. The action takes an optional
    // schoolId in the input; we pass the other school's id explicitly.
    const result = await createProgramme({
      name: "Cross-school hack",
      code: "XSC",
      durationYears: 4,
      isActive: true,
      schoolId: otherSchoolId,
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/different school/i);

    const total = await prisma.programme.count();
    expect(total).toBe(0);
  });
});