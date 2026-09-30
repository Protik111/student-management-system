import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { authConfig } from "./auth.config";
import { db } from "@/lib/db";
import { userRoles, users, type Role } from "@/lib/db/schema";

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

        const userRow = db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1)
          .get();

        if (!userRow || !userRow.isActive) return null;

        const ok = await bcrypt.compare(password, userRow.passwordHash);
        if (!ok) return null;

        const roles = db
          .select()
          .from(userRoles)
          .where(eq(userRoles.userId, userRow.id))
          .all();

        const roleNames = roles.map((r) => r.role);

        // Bump lastLoginAt (fire and forget — failures don't block auth)
        try {
          db.update(users)
            .set({ lastLoginAt: new Date() })
            .where(eq(users.id, userRow.id))
            .run();
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