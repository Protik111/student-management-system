import type { GradeClassification } from "@prisma/client";

/**
 * Per the assessment spec, apply this classification to a numeric mark:
 *   Pass ≥ 40
 *   Merit ≥ 60
 *   Distinction ≥ 70
 *   Otherwise Fail
 *
 * `maxMarks` lets the caller express the scale; the thresholds here are
 * interpreted as percentages so 40/100 and 80/200 both map correctly.
 */
export function classify(marks: number, maxMarks: number): GradeClassification {
  if (maxMarks <= 0) return "fail";
  const pct = (marks / maxMarks) * 100;
  if (pct >= 70) return "distinction";
  if (pct >= 60) return "merit";
  if (pct >= 40) return "pass";
  return "fail";
}

export const GRADE_LABEL: Record<GradeClassification, string> = {
  fail: "Fail",
  pass: "Pass",
  merit: "Merit",
  distinction: "Distinction",
};

export const GRADE_TONE: Record<
  GradeClassification,
  "danger" | "warning" | "info" | "success"
> = {
  fail: "danger",
  pass: "info",
  merit: "info",
  distinction: "success",
};
