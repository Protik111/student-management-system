"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import type { AssessmentStatus } from "@prisma/client";

export interface AssessmentRow {
  id: string;
  title: string;
  module: string;
  status: AssessmentStatus;
  deadline: Date;
  className: string;
  classSection: string;
  subjectName: string;
  teacherName: string;
  submissionCount: number;
  gradedCount: number;
}

const STATUS_TONE: Record<AssessmentStatus, "default" | "success" | "warning" | "danger" | "info"> = {
  draft: "default",
  open: "info",
  closed: "warning",
  graded: "success",
};

const STATUS_LABEL: Record<AssessmentStatus, string> = {
  draft: "Draft",
  open: "Open",
  closed: "Closed",
  graded: "Graded",
};

interface AssessmentListProps {
  variant: "teacher" | "student";
  assessments: AssessmentRow[];
  newHref?: string;
}

function isPast(d: Date) {
  return d.getTime() < Date.now();
}

export default function AssessmentList({
  variant,
  assessments,
  newHref,
}: AssessmentListProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={variant === "teacher" ? "Assessments" : "My assessments"}
        description={
          variant === "teacher"
            ? "Create work, then grade and publish student submissions."
            : "Open assignments for your class — submit on time, see your grade once published."
        }
        actions={
          newHref ? (
            <Button href={newHref}>
              <Plus className="h-4 w-4" aria-hidden /> New assessment
            </Button>
          ) : undefined
        }
      />

      {assessments.length === 0 ? (
        <EmptyState
          title={variant === "teacher" ? "No assessments yet" : "Nothing to do right now"}
          description={
            variant === "teacher"
              ? "Create your first assessment to send a notification to your class."
              : "When teachers publish work for your class it'll show up here."
          }
          action={
            newHref ? (
              <Button href={newHref}>
                <Plus className="h-4 w-4" aria-hidden /> Create assessment
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-default">
            <thead>
              <tr className="border-b border-border text-meta uppercase tracking-[0.06em] text-text-subtle">
                <th className="px-4 py-3 text-left font-semibold">Title</th>
                <th className="px-4 py-3 text-left font-semibold">Class · Subject</th>
                <th className="px-4 py-3 text-left font-semibold">Deadline</th>
                {variant === "teacher" ? (
                  <th className="px-4 py-3 text-left font-semibold">Submissions</th>
                ) : (
                  <th className="px-4 py-3 text-left font-semibold">Your grade</th>
                )}
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold" />
              </tr>
            </thead>
            <tbody>
              {assessments.map((a) => {
                const overdue =
                  variant === "student" &&
                  a.status === "open" &&
                  isPast(a.deadline);
                return (
                  <tr
                    key={a.id}
                    className="border-b border-border last:border-b-0 hover:bg-base transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        href={
                          variant === "teacher"
                            ? `/teacher/assessments/${a.id}`
                            : `/student/assessments/${a.id}`
                        }
                        className="font-medium text-text hover:text-emerald"
                      >
                        {a.title}
                      </Link>
                      <div className="text-meta text-text-subtle">{a.module}</div>
                    </td>
                    <td className="px-4 py-3.5 text-text-muted">
                      <span className="font-medium text-text">
                        {a.className}
                        {a.classSection && ` – ${a.classSection}`}
                      </span>
                      <div className="text-meta text-text-subtle">
                        {a.subjectName}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-text-muted">
                      <div>{new Date(a.deadline).toLocaleDateString()}</div>
                      <div className="text-meta text-text-subtle">
                        {new Date(a.deadline).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {overdue && (
                          <Badge tone="warning" className="ml-2">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </td>
                    {variant === "teacher" ? (
                      <td className="px-4 py-3.5 text-text-muted">
                        <span className="font-medium text-text">
                          {a.submissionCount}
                        </span>
                        <span className="text-meta text-text-subtle">
                          {" "}
                          · {a.gradedCount} graded
                        </span>
                      </td>
                    ) : (
                      <td className="px-4 py-3.5">
                        {a.gradedCount > 0 ? (
                          <Badge tone="success">Graded</Badge>
                        ) : (
                          <Badge tone="neutral">Awaiting</Badge>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3.5">
                      <Badge tone={STATUS_TONE[a.status] ?? "neutral"}>
                        {STATUS_LABEL[a.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={
                          variant === "teacher"
                            ? `/teacher/assessments/${a.id}`
                            : `/student/assessments/${a.id}`
                        }
                        className="text-meta font-medium text-emerald hover:underline"
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}