import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { authConfig } from "./auth.config";
import { prisma } from "@/lib/db/prisma";
import type { Role } from "@/lib/db/types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    // Node-runtime override of the edge-safe callback. Re-fetches the role from
    // the DB when the existing JWT is missing one, so a stale/legacy cookie
    // never produces `session.user.role === undefined` (which would later make
    // /redirect to /undefined).
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: Role }).role;
        token.schoolId = (user as { schoolId?: string | null }).schoolId ?? null;
        token.fullName = user.name;
        token.email = user.email ?? undefined;
        return token;
      }

      if (!token.role && token.id) {
        const fresh = await prisma.userRole.findFirst({
          where: { userId: token.id as string },
          select: { role: true },
        });
        if (fresh) token.role = fresh.role;
      }
      return token;
    },
  },
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