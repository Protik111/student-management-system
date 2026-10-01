import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "./auth.config";
import type { Role } from "@/lib/db/types";

const { auth: middlewareAuth } = NextAuth(authConfig);

/** Routes that require a specific primary role. */
const ROLE_ROUTES: Record<string, Role> = {
  "/admin": "ADMIN",
  "/teacher": "TEACHER",
  "/student": "STUDENT",
};

export default middlewareAuth((req) => {
  const { pathname } = req.nextUrl;

  // Find the role prefix this request matches
  const matched = Object.keys(ROLE_ROUTES).find((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!matched) return NextResponse.next();

  const requiredRole = ROLE_ROUTES[matched];
  const userRole = req.auth?.user?.role;

  // Not logged in → middleware authorized callback already redirected to /login
  if (!userRole) return NextResponse.next();

  if (userRole !== requiredRole) {
    // Logged in but wrong role → 403 page
    const url = req.nextUrl.clone();
    url.pathname = "/unauthorized";
    url.searchParams.set("required", requiredRole);
    url.searchParams.set("actual", userRole);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  // Skip Next internals and static files; protect everything else.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|api/auth|api/cron).*)"],
};