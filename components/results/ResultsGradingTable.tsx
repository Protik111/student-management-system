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
  publishAllResultsForExamSubject,
  publishExamResult,
  upsertExamResult,
  type ExamSubjectRow,
} from "@/lib/actions/results";

interface ResultsGradingTableProps {
  rows: ExamSubjectRow[];
  examSubjectId: string;
  examName: string;
}

interface DraftEntry {
  marks: string;
  remarks: string;
}

export default function ResultsGradingTable({
  rows,
  examSubjectId,
  examName,
}: ResultsGradingTableProps) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [bulkPending, startBulk] = useTransition();
  const [drafts, setDrafts] = useState<Record<string, DraftEntry>>({});

  function setDraft(studentId: string, partial: Partial<DraftEntry>) {
    setDrafts((prev) => {
      const base: DraftEntry = prev[studentId] ?? { marks: "", remarks: "" };
      return {
        ...prev,
        [studentId]: { ...base, ...partial },
      };
    });
  }

  function save(studentId: string, maxMarks: number) {
    const d = drafts[studentId];
    if (!d) return;
    const marks = Number(d.marks);
    if (Number.isNaN(marks) || marks < 0) {
      toast.error({ title: "Enter a valid mark" });
      return;
    }
    if (marks > maxMarks) {
      toast.error({ title: `Marks exceed max (${maxMarks})` });
      return;
    }
    startTransition(async () => {
      const res = await upsertExamResult({
        examSubjectId,
        studentId,
        marksObtained: marks,
        remarks: d.remarks || undefined,
      });
      if (!res.ok) {
        toast.error({ title: "Couldn't save result", description: res.error });
        return;
      }
      toast.success({
        title: `Saved — ${res.data.grade}`,
        description: `${marks}/${maxMarks}`,
      });
      router.refresh();
    });
  }

  function togglePublish(resultId: string, isPublished: boolean) {
    startTransition(async () => {
      const res = await publishExamResult(resultId, !isPublished);
      if (!res.ok) {
        toast.error({
          title: "Couldn't update publish state",
          description: res.error,
        });
        return;
      }
      toast.success({
        title: res.data.published ? "Published" : "Withheld",
      });
      router.refresh();
    });
  }

  function publishAll() {
    startBulk(async () => {
      const res = await publishAllResultsForExamSubject(examSubjectId);
      if (!res.ok) {
        toast.error({ title: "Couldn't publish all", description: res.error });
        return;
      }
      toast.success({ title: `Published ${res.data.count} results` });
      router.refresh();
    });
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-border bg-card p-10 text-center text-default text-text-muted">
        No students enrolled for this subject yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-default text-text-muted">
          {rows.length} student{rows.length === 1 ? "" : "s"} in this subject.
        </p>
        <Button size="sm" onClick={publishAll} loading={bulkPending} disabled={pending}>
          <Eye className="h-4 w-4" aria-hidden /> Publish all
        </Button>
      </div>

      <div className="overflow-hidden rounded-card border border-border bg-card">
        <table className="w-full text-default">
          <thead>
            <tr className="border-b border-border bg-base text-meta uppercase tracking-[0.06em] text-text-subtle">
              <th className="px-4 py-3 text-left font-semibold">Student</th>
              <th className="px-4 py-3 text-left font-semibold">Marks</th>
              <th className="px-4 py-3 text-left font-semibold">Remarks</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const draft = drafts[r.studentId] ?? {
                marks: r.result?.marksObtained?.toString() ?? "",
                remarks: r.result?.remarks ?? "",
              };
              const numeric = Number(draft.marks);
              const preview =
                !Number.isNaN(numeric) && draft.marks !== ""
                  ? classify(numeric, r.maxMarks)
                  : null;
              const isPublished = r.result?.published ?? false;
              return (
                <tr
                  key={r.studentId}
                  className="border-b border-border last:border-b-0 hover:bg-base transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-text">{r.studentName}</div>
                    <div className="text-meta text-text-subtle">
                      {r.admissionNo} · max {r.maxMarks}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={r.maxMarks}
                        placeholder={`/ ${r.maxMarks}`}
                        value={draft.marks}
                        onChange={(e) =>
                          setDraft(r.studentId, { marks: e.target.value })
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
                        setDraft(r.studentId, { remarks: e.target.value })
                      }
                      className="w-full min-w-[180px] rounded-chip border border-border bg-base px-2.5 py-1.5 text-default text-text focus:border-emerald focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    {r.result ? (
                      <div className="flex flex-col gap-1">
                        <Badge tone={isPublished ? "success" : "neutral"}>
                          {isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    ) : (
                      <Badge tone="neutral">Not entered</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => save(r.studentId, r.maxMarks)}
                        loading={pending}
                      >
                        <Save className="h-4 w-4" aria-hidden /> Save
                      </Button>
                      {r.result && (
                        <Button
                          size="sm"
                          variant={isPublished ? "ghost" : "secondary"}
                          onClick={() => togglePublish(r.result!.id, isPublished)}
                          loading={pending}
                        >
                          {isPublished ? (
                            <>
                              <EyeOff className="h-4 w-4" aria-hidden /> Withhold
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" aria-hidden /> Publish
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

      <p className="text-meta text-text-subtle">
        Showing marks for {examName}.
      </p>
    </div>
  );
}