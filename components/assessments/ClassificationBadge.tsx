import Badge from "@/components/ui/Badge";
import { GRADE_LABEL, GRADE_TONE } from "@/lib/grading";
import type { GradeClassification } from "@prisma/client";

const TONE_TO_BADGE: Record<
  GradeClassification,
  "default" | "success" | "warning" | "danger" | "info"
> = {
  fail: "danger",
  pass: "info",
  merit: "info",
  distinction: "success",
};

interface ClassificationBadgeProps {
  classification: GradeClassification;
}

export default function ClassificationBadge({
  classification,
}: ClassificationBadgeProps) {
  return (
    <Badge tone={TONE_TO_BADGE[classification] ?? "default"}>
      {GRADE_LABEL[classification]}
    </Badge>
  );
}