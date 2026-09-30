import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { authConfig } from "./auth.config";
import { prisma } from "@/lib/db/prisma";
import type { Role } from "@/lib/db/types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string | undefined)?.trim().toLowerCase();
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const userRow = await prisma.user.findUnique({
          where: { email },
        });

        if (!userRow || !userRow.isActive) return null;

        const ok = await bcrypt.compare(password, userRow.passwordHash);
        if (!ok) return null;

        const roles = await prisma.userRole.findMany({
          where: { userId: userRow.id },
          select: { role: true },
        });
        const roleNames = roles.map((r) => r.role);

        // Bump lastLoginAt (fire and forget — failures don't block auth)
        try {
          await prisma.user.update({
            where: { id: userRow.id },
            data: { lastLoginAt: new Date() },
          });
        } catch {
          /* ignore */
        }

        return {
          id: userRow.id,
          email: userRow.email,
          name: userRow.fullName,
          role: (userRow.primaryRole ?? roleNames[0]) as Role,
          schoolId: userRow.schoolId,
          fullName: userRow.fullName,
          roles: roleNames,
        } as unknown as import("next-auth").User;
      },
    }),
  ],
});