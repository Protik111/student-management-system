"use client";

import { useEffect, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { ROLE_HOME, type Role } from "@/lib/rbac";

/**
 * Client-side Higher-Order Component that gates a component on the current
 * session having one of the expected roles.
 *
 * Behavior:
 *   - Session `loading`: render `fallback` (or null).
 *   - Unauthenticated: `router.replace("/login")`.
 *   - Authenticated but role mismatch: `router.replace("/unauthorized")`.
 *   - Role match: render the wrapped component, passing through props.
 *
 * Server-side gates (`requireRole` / `requirePermission` in lib/auth-helpers)
 * remain the source of truth — this HOC exists for client-rendered pages and
 * interactive surfaces that want to avoid a flash of forbidden content
 * before the route guard kicks in.
 *
 * Usage:
 *   export default withRole(["ADMIN", "TEACHER"], MyClientComponent);
 */
export function withRole<P extends object>(
  roles: Role | readonly Role[],
  Component: ComponentType<P>,
  options?: {
    /** Optional element rendered while session is loading. Defaults to null. */
    fallback?: React.ReactNode;
  },
) {
  const allowed: readonly Role[] = Array.isArray(roles) ? roles : [roles];

  function Wrapped(props: P) {
    const { data: session, status } = useSession();
    const router = useRouter();

    const role = (session?.user?.role ?? null) as Role | null;

    useEffect(() => {
      if (status === "loading") return;
      if (!session) {
        router.replace("/login");
        return;
      }
      if (!role || !allowed.includes(role)) {
        // Bounce to the unauthorized screen (or, as a last-ditch fallback,
        // the user's own home if the route allows it).
        if (role) {
          router.replace(ROLE_HOME[role] ?? "/login");
        } else {
          router.replace("/unauthorized");
        }
      }
    }, [status, session, role, router]);

    if (status === "loading") return <>{options?.fallback ?? null}</>;
    if (!session || !role || !allowed.includes(role)) {
      return <>{options?.fallback ?? null}</>;
    }
    return <Component {...props} />;
  }

  Wrapped.displayName = `withRole(${Component.displayName ?? Component.name ?? "Component"})`;
  return Wrapped;
}

export default withRole;