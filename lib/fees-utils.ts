/**
 * Shared client/server utilities for the fees module. Lives outside
 * `lib/actions/fees.ts` (which uses "use server") so it can be imported
 * freely by client components and pages.
 */
export type { FeeStatus, PaymentMethod } from "@prisma/client";

/** Format a cents integer as `1,234.56` (assumes 2 decimal places). */
export function formatCents(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const frac = abs % 100;
  const wholeWithCommas = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}${wholeWithCommas}.${frac.toString().padStart(2, "0")}`;
}

export const FEE_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  partial: "Partial",
  paid: "Paid",
  overdue: "Overdue",
  waived: "Waived",
  cancelled: "Cancelled",
};

export const FEE_STATUS_TONE: Record<
  string,
  "default" | "success" | "warning" | "danger" | "info" | "neutral"
> = {
  pending: "info",
  partial: "warning",
  paid: "success",
  overdue: "danger",
  waived: "neutral",
  cancelled: "neutral",
};
