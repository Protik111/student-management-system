import Link from "next/link";

import { cn } from "@/lib/cn";
import type { Gender } from "@/lib/db/types";

interface StudentNameCellProps {
  admissionNo: string;
  fullName: string;
  gender?: Gender | null;
  email?: string;
  /** When provided, wraps the name in a link to /students/{enrollmentsHref}. */
  enrollmentsHref?: string;
  /** When provided, the link points to a path inside the admin namespace. */
  hrefBase: "/admin";
  className?: string;
}

/**
 * Compact display of a student: admission number + name (linked to enrollment
 * history when applicable), plus an optional gender pill.
 *
 * Used by `StudentsList` tables and the enrollment history header.
 */
export default function StudentNameCell({
  admissionNo,
  fullName,
  gender,
  email,
  enrollmentsHref,
  hrefBase,
  className,
}: StudentNameCellProps) {
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  const genderDot =
    gender === "male"
      ? "bg-info"
      : gender === "female"
      ? "bg-pink-500"
      : "bg-text-subtle";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-bg text-meta font-semibold text-emerald">
        {initials || "?"}
        {gender && (
          <span
            aria-hidden
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card",
              genderDot,
            )}
          />
        )}
      </div>
      <div className="min-w-0">
        <div className="font-medium text-text">
          {enrollmentsHref ? (
            <Link
              href={`${hrefBase}/students/${enrollmentsHref}/enrollments`}
              className="hover:text-emerald hover:underline"
            >
              {fullName}
            </Link>
          ) : (
            fullName
          )}
        </div>
        <div className="text-meta text-text-subtle">
          <span className="font-mono">{admissionNo}</span>
          {email && <span className="ml-2">· {email}</span>}
        </div>
      </div>
    </div>
  );
}