import type { NextAuthConfig } from "next-auth";

import type { Role } from "@/lib/db/schema";

/**
 * Edge-safe NextAuth config. Imported by `middleware.ts` so it must NOT pull
 * in Node-only modules like `bcryptjs` or `@/lib/db`.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      // Always allow public routes
      if (
        pathname === "/" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/unauthorized") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/cron") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon")
      ) {
        return true;
      }

      // Everything else requires authentication
      return !!auth?.user;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: Role }).role;
        token.schoolId = (user as { schoolId?: string | null }).schoolId ?? null;
        token.fullName = user.name;
        token.email = user.email ?? undefined;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.schoolId = (token.schoolId as string | null) ?? null;
        session.user.fullName = (token.fullName as string) ?? session.user.name ?? "";
        session.user.email = (token.email as string) ?? session.user.email ?? "";
      }
      return session;
    },
  },
  providers: [], // Providers are attached in `auth.ts` (Node-only).
} satisfies NextAuthConfig;