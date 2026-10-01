"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Save } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ClassificationBadge from "@/components/assessments/ClassificationBadge";
import { useToast } from "@/contexts/ToastContext";
import { classify } from "@/lib/grading";
import {
  enterOrUpdateGrade,
  publishAssessmentGrade,
  publishAllGradesForAssessment,
  type SubmissionForTeacher,
} from "@/lib/actions/assessments";

interface GradingTableProps {
  assessmentId: string;
  maxMarks: number;
  submissions: SubmissionForTeacher[];
}

interface DraftGrade {
  marks: string;
  remarks: string;
}

export default function GradingTable({
  assessmentId,
  maxMarks,
  submissions,
}: GradingTableProps) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [bulkPending, startBulk] = useTransition();
  const [drafts, setDrafts] = useState<Record<string, DraftGrade>>({});

  function setDraft(studentId: string, partial: Partial<DraftGrade>) {
    setDrafts((prev) => {
      const base: DraftGrade = prev[studentId] ?? { marks: "", remarks: "" };
      return {
        ...prev,
        [studentId]: { ...base, ...partial },
      };
    });
  }

  function save(studentId: string) {
    const d = drafts[studentId];
    if (!d) return;
    const marks = Number(d.marks);
    if (Number.isNaN(marks) || marks < 0) {
      toast.error({ title: "Enter a valid mark" });
      return;
    }
    startTransition(async () => {
      const res = await enterOrUpdateGrade({
        assessmentId,
        studentId,
        marksObtained: marks,
        remarks: d.remarks || undefined,
      });
      if (!res.ok) {
        toast.error({ title: "Couldn't save grade", description: res.error });
        return;
      }
      toast.success({
        title: `Saved — ${res.data.classification}`,
        description: `${marks}/${maxMarks}`,
      });
      router.refresh();
    });
  }

  function togglePublish(studentId: string, currentlyPublished: boolean) {
    startTransition(async () => {
      const res = await publishAssessmentGrade(
        assessmentId,
        studentId,
        !currentlyPublished,
      );
      if (!res.ok) {
        toast.error({
          title: "Couldn't update publish state",
          description: res.error,
        });
        return;
      }
      toast.success({
        title: res.data.published ? "Published to student" : "Withheld",
      });
      router.refresh();
    });
  }

  function publishAll() {
    startBulk(async () => {
      const res = await publishAllGradesForAssessment(assessmentId);
      if (!res.ok) {
        toast.error({ title: "Couldn't publish all", description: res.error });
        return;
      }
      toast.success({ title: `Published ${res.data.count} grades` });
      router.refresh();
    });
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border bg-card p-10 text-center text-default text-text-muted">
        No submissions yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-default text-text-muted">
          {submissions.length} student{submissions.length === 1 ? "" : "s"}{" "}
          have submitted.
        </p>
        <Button
          size="sm"
          onClick={publishAll}
          loading={bulkPending}
          disabled={pending}
        >
          <Eye className="h-4 w-4" aria-hidden /> Publish all
        </Button>
      </div>

      <div className="overflow-hidden rounded-card border border-border bg-card">
        <table className="w-full text-default">
          <thead>
            <tr className="border-b border-border bg-base text-meta uppercase tracking-[0.06em] text-text-subtle">
              <th className="px-4 py-3 text-left font-semibold">Student</th>
              <th className="px-4 py-3 text-left font-semibold">Submission</th>
              <th className="px-4 py-3 text-left font-semibold">Grade</th>
              <th className="px-4 py-3 text-left font-semibold">Remarks</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => {
              const draft = drafts[s.studentId] ?? {
                marks: s.grade?.marksObtained?.toString() ?? "",
                remarks: s.grade?.remarks ?? "",
              };
              const numericMarks = Number(draft.marks);
              const preview =
                !Number.isNaN(numericMarks) && draft.marks !== ""
                  ? classify(numericMarks, maxMarks)
                  : null;
              const isPublished = s.grade?.published ?? false;
              return (
                <tr
                  key={s.id}
                  className="border-b border-border last:border-b-0 hover:bg-base transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-text">{s.studentName}</div>
                    <div className="text-meta text-text-subtle">
                      {s.studentAdmissionNo}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1">
                      <a
                        href={s.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-meta text-emerald hover:underline"
                      >
                        Attempt {s.attempt} · {s.fileName}
                      </a>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="neutral">
                          {new Date(s.submittedAt).toLocaleString()}
                        </Badge>
                        {s.isLate && <Badge tone="warning">Late</Badge>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={maxMarks}
                        placeholder={`/ ${maxMarks}`}
                        value={draft.marks}
                        onChange={(e) =>
                          setDraft(s.studentId, { marks: e.target.value })
                        }
                        className="w-20 rounded-chip border border-border bg-base px-2.5 py-1.5 text-default text-text focus:border-emerald focus:outline-none"
                      />
                      {preview && (
                        <ClassificationBadge classification={preview} />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <input
                      type="text"
                      placeholder="Optional"
                      value={draft.remarks}
                      onChange={(e) =>
                        setDraft(s.studentId, { remarks: e.target.value })
                      }
                      className="w-full min-w-[180px] rounded-chip border border-border bg-base px-2.5 py-1.5 text-default text-text focus:border-emerald focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    {s.grade ? (
                      <div className="flex flex-col gap-1">
                        <ClassificationBadge
                          classification={s.grade.classification}
                        />
                        <Badge tone={isPublished ? "success" : "neutral"}>
                          {isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    ) : (
                      <Badge tone="neutral">Not graded</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => save(s.studentId)}
                        loading={pending}
                      >
                        <Save className="h-4 w-4" aria-hidden /> Save
                      </Button>
                      {s.grade && (
                        <Button
                          size="sm"
                          variant={isPublished ? "ghost" : "secondary"}
                          onClick={() => togglePublish(s.studentId, isPublished)}
                          loading={pending}
                        >
                          {isPublished ? (
                            <>
                              <EyeOff className="h-4 w-4" aria-hidden /> Withhold
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" aria-hidden />{" "}
                              Publish
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}