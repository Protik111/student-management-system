import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requirePermission } from "@/lib/auth-helpers";
import {
  getAssessmentDetail,
  listSubmissionsForAssessment,
} from "@/lib/actions/assessments";
import GradingTable from "@/components/assessments/GradingTable";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherAssessmentDetailPage({
  params,
}: PageProps) {
  await requirePermission("manage_assessments");
  const { id } = await params;

  const [assessment, submissions] = await Promise.all([
    getAssessmentDetail(id),
    listSubmissionsForAssessment(id),
  ]);

  if (!assessment) notFound();

  const isOverdue = assessment.deadline.getTime() < Date.now();

  return (
    <div className="space-y-6">
      <PageHeader
        title={assessment.title}
        description={
          assessment.description ||
          "Review submissions, enter grades, and publish them to students."
        }
        actions={
          <Link
            href="/teacher/assessments"
            className="inline-flex items-center gap-2 text-meta font-medium text-text-muted hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to list
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoTile label="Class" value={`${assessment.class.name}${assessment.class.section ? ` – ${assessment.class.section}` : ""}`} />
        <InfoTile label="Subject" value={assessment.subject.name} />
        <InfoTile
          label="Deadline"
          value={new Date(assessment.deadline).toLocaleString()}
          tone={isOverdue ? "warning" : "default"}
        />
        <InfoTile
          label="Max marks"
          value={assessment.maxMarks.toString()}
        />
      </section>

      <section className="space-y-3">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-card-title font-semibold text-text">
              Submissions & grading
            </h2>
            <p className="text-default text-text-muted">
              Module: <span className="font-medium text-text">{assessment.module}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="info">{assessment.allowResub ? "Resub allowed" : "One-shot"}</Badge>
            <Badge tone={assessment.lateAccepted ? "info" : "warning"}>
              {assessment.lateAccepted ? "Late accepted" : "Late rejected"}
            </Badge>
          </div>
        </header>

        <GradingTable
          assessmentId={assessment.id}
          maxMarks={assessment.maxMarks}
          submissions={submissions}
        />
      </section>
    </div>
  );
}

function InfoTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warning";
}) {
  return (
    <div className="rounded-card border border-border bg-card p-4">
      <p className="text-meta font-semibold uppercase tracking-[0.06em] text-text-subtle">
        {label}
      </p>
      <p
        className={`mt-1 text-default font-medium ${
          tone === "warning" ? "text-warning" : "text-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}