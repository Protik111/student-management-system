import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

import { requireRole } from "@/lib/auth-helpers";
import { getStudentSubmissionForAssessment } from "@/lib/actions/assessments";
import SubmissionUploader from "@/components/assessments/SubmissionUploader";
import ClassificationBadge from "@/components/assessments/ClassificationBadge";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function StudentAssessmentDetailPage({
  params,
}: PageProps) {
  await requireRole("STUDENT");
  const { id } = await params;
  const view = await getStudentSubmissionForAssessment(id);
  if (!view) notFound();
  const { assessment, submissions, grade } = view;

  const isOverdue = assessment.deadline.getTime() < Date.now();
  const isClosed = assessment.status !== "open";
  const latestAttempt = submissions[submissions.length - 1];
  const showUploader = !isClosed && (assessment.lateAccepted || !isOverdue);

  return (
    <div className="space-y-6">
      <PageHeader
        title={assessment.title}
        description={
          assessment.description ||
          "Read the brief, upload your work, and track your grade."
        }
        actions={
          <Link
            href="/student/assessments"
            className="inline-flex items-center gap-2 text-meta font-medium text-text-muted hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoTile
          label="Subject"
          value={assessment.subject.name}
        />
        <InfoTile
          label="Class"
          value={`${assessment.class.name}${assessment.class.section ? ` – ${assessment.class.section}` : ""}`}
        />
        <InfoTile
          label="Deadline"
          value={new Date(assessment.deadline).toLocaleString()}
          tone={isOverdue ? "warning" : "default"}
        />
        <InfoTile label="Teacher" value={assessment.teacher.user.fullName} />
      </section>

      <section className="rounded-card border border-border bg-card p-5">
        <p className="text-meta font-semibold uppercase tracking-[0.06em] text-text-subtle">
          Brief
        </p>
        <p className="mt-1 text-default text-text-muted">
          Module: <span className="font-medium text-text">{assessment.module}</span>
        </p>
        {assessment.description && (
          <p className="mt-2 text-default text-text">{assessment.description}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="info">{assessment.maxMarks} marks max</Badge>
          <Badge tone={assessment.allowResub ? "info" : "warning"}>
            {assessment.allowResub ? "Resubmissions allowed" : "One-shot"}
          </Badge>
          <Badge tone={assessment.lateAccepted ? "info" : "warning"}>
            {assessment.lateAccepted ? "Late accepted" : "Late rejected"}
          </Badge>
        </div>
      </section>

      {grade && grade.published ? (
        <section className="rounded-card border border-success/30 bg-success-bg/40 p-5">
          <p className="text-meta font-semibold uppercase tracking-[0.06em] text-success">
            Your grade
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-section font-bold text-text">
              {grade.marksObtained}/{assessment.maxMarks}
            </span>
            <ClassificationBadge classification={grade.classification} />
          </div>
          {grade.remarks && (
            <p className="mt-3 text-default text-text-muted">
              <span className="font-semibold text-text">Remarks:</span>{" "}
              {grade.remarks}
            </p>
          )}
        </section>
      ) : grade && !grade.published ? (
        <section className="rounded-card border border-border bg-card p-5">
          <p className="text-meta font-semibold uppercase tracking-[0.06em] text-text-subtle">
            Grade status
          </p>
          <p className="mt-1 text-default text-text-muted">
            Your teacher has graded this work but hasn't published it yet.
          </p>
        </section>
      ) : null}

      {showUploader ? (
        <section className="rounded-card border border-border bg-card p-5">
          <SubmissionUploader
            assessmentId={assessment.id}
            allowResub={assessment.allowResub}
            hasExisting={Boolean(latestAttempt)}
          />
        </section>
      ) : (
        <section className="rounded-card border border-warning/30 bg-warning-bg/40 p-5">
          <p className="text-default text-warning">
            Submissions are closed for this work.
          </p>
        </section>
      )}

      {submissions.length > 0 && (
        <section className="rounded-card border border-border bg-card p-5">
          <h3 className="text-card-title font-semibold text-text">
            Submission history
          </h3>
          <ul className="mt-3 space-y-2">
            {submissions.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-chip border border-border bg-base p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-chip bg-emerald-bg text-emerald">
                    <FileText className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <a
                      href={s.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block font-medium text-text hover:text-emerald"
                    >
                      Attempt {s.attempt} · {s.fileName}
                    </a>
                    <p className="text-meta text-text-subtle">
                      {new Date(s.submittedAt).toLocaleString()} ·{" "}
                      {formatBytes(s.fileBytes)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">{s.status.replaceAll("_", " ")}</Badge>
                  {s.isLate && <Badge tone="warning">Late</Badge>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
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