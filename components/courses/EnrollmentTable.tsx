"use client";

import { useRouter } from "next/navigation";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { useToast } from "@/contexts/ToastContext";
import {
  type CourseEnrollmentRow,
  removeStudentFromCourse,
} from "@/lib/actions/course-enrollments";

interface EnrollmentTableProps {
  courseId: string;
  rows: CourseEnrollmentRow[];
  scope: "ADMIN" | "TEACHER";
}

const SOURCE_TONE: Record<"enrolled" | "added", "info" | "warning"> = {
  enrolled: "info",
  added: "warning",
};

const SOURCE_LABEL: Record<"enrolled" | "added", string> = {
  enrolled: "Self-enrolled",
  added: "Added by staff",
};

export default function EnrollmentTable({
  courseId,
  rows,
  scope,
}: EnrollmentTableProps) {
  const router = useRouter();
  const toast = useToast();

  const remove = useConfirmAction<CourseEnrollmentRow>({
    title: (r) => `Remove ${r.studentName}?`,
    description: (r) =>
      `${r.studentName} will lose access to materials in this course.`,
    confirmText: "Remove",
    variant: "danger",
    successTitle: "Student removed",
    action: async (r) => {
      const res = await removeStudentFromCourse({
        courseId,
        studentId: r.studentId,
      });
      if (!res.ok) throw new Error(res.error);
    },
    onSuccess: () => router.refresh(),
  });

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No students enrolled"
        description={
          scope === "ADMIN"
            ? "Use Add student to put a student into this course."
            : "Students can self-enroll from the marketplace."
        }
      />
    );
  }

  return (
    <>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-default">
          <thead>
            <tr className="border-b border-border text-meta uppercase tracking-[0.06em] text-text-subtle">
              <th className="px-4 py-3 text-left font-semibold">Student</th>
              <th className="px-4 py-3 text-left font-semibold">Source</th>
              <th className="px-4 py-3 text-left font-semibold">Enrolled on</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-border last:border-b-0 hover:bg-base transition-colors"
              >
                <td className="px-4 py-3.5">
                  <div className="font-medium text-text">{r.studentName}</div>
                  <div className="text-meta text-text-subtle">
                    {r.studentEmail}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <Badge tone={SOURCE_TONE[r.source]}>
                    {SOURCE_LABEL[r.source]}
                  </Badge>
                </td>
                <td className="px-4 py-3.5 text-text-muted">
                  {r.enrolledAt.toLocaleDateString()}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove.confirm(r)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <ConfirmDialog {...remove.dialogProps} />
    </>
  );
}