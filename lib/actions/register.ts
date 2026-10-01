"use server";

import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/actions/schemas";
import { ok, fail, type ActionResult } from "@/lib/actions/_helpers";

/**
 * Public self-registration. Always creates a STUDENT account.
 * - Email uniqueness enforced by DB constraint.
 * - Password is bcrypt-hashed at the standard cost factor.
 * - The new user is added to the UserRole table with role=STUDENT so
 *   permission lookups work.
 *
 * Anyone can call this — it is the public /register endpoint.
 */
export async function registerStudent(
  input: RegisterInput,
): Promise<ActionResult<{ id: string; email: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return fail(firstIssue?.message ?? "Invalid input", {
      form: [firstIssue?.message ?? "Invalid input"],
    });
  }

  const { fullName, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Reject obvious collisions before paying for bcrypt.
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existing) {
    return fail("An account with that email already exists.", {
      email: ["An account with that email already exists."],
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: normalizedEmail,
          fullName,
          passwordHash,
          primaryRole: "STUDENT",
          // Public registrants are not yet attached to any school.
          schoolId: null,
          isActive: true,
        },
        select: { id: true, email: true },
      });
      await tx.userRole.create({
        data: { userId: user.id, role: "STUDENT" },
      });
      return created;
    });

    return ok({ id: user.id, email: user.email });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return fail("An account with that email already exists.", {
        email: ["An account with that email already exists."],
      });
    }
    return fail((e as Error).message ?? "Couldn't create account");
  }
}