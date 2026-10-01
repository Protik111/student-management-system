import Link from "next/link";
import { Download } from "lucide-react";

import { requirePermission } from "@/lib/auth-helpers";
import {
  listExamReports,
  listStudentsWithResultsForExam,
} from "@/lib/actions/results";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ examId?: string }>;
}

export default async function SchoolReportsPage({
  searchParams,
}: PageProps) {
  await requirePermission("generate_report_cards");
  const { examId } = await searchParams;
  const exams = await listExamReports();
  const current = examId
    ? exams.find((e) => e.id === examId)
    : exams[0];
  const students = current ? await listStudentsWithResultsForExam(current.id) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Pick an exam, generate report cards per student, and publish them so students see their results."
      />

      {exams.length === 0 ? (
        <EmptyState
          title="No exams yet"
          description="Create an exam before generating report cards."
        />
      ) : (
        <Card className="p-4">
          <p className="text-meta font-semibold uppercase tracking-[0.06em] text-text-subtle">
            Exam
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {exams.map((e) => {
              const params = new URLSearchParams();
              params.set("examId", e.id);
              const isActive = current?.id === e.id;
              return (
                <Link
                  key={e.id}
                  href={`/admin/reports?${params.toString()}`}
                  className={`inline-flex items-center rounded-chip border px-3 py-1.5 text-meta font-medium transition-colors ${
                    isActive
                      ? "border-emerald bg-emerald-bg text-emerald"
                      : "border-border bg-card text-text hover:border-emerald hover:text-emerald"
                  }`}
                >
                  {e.name}
                  <span className="ml-1.5 text-meta text-text-subtle">
                    ({e.term}, {e.academicYear})
                  </span>
                </Link>
              );
            })}
          </div>
        </Card>
      )}

      {current && (
        <section className="space-y-3">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h2 className="text-card-title font-semibold text-text">
                {current.name}
              </h2>
              <p className="text-meta text-text-subtle">
                {current.term} · {current.academicYear}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="info">
                {current.subjectCount} subjects
              </Badge>
              <Badge tone="info">
                {current.publishedResultCount}/{current.resultCount} published
              </Badge>
              <Badge tone="info">
                {current.publishedReportCardCount}/{current.reportCardCount} cards
              </Badge>
            </div>
          </header>

          {students.length === 0 ? (
            <EmptyState
              title="No students"
              description="Admit students to this school first."
            />
          ) : (
            <Card className="p-0 overflow-hidden">
              <table className="w-full text-default">
                <thead>
                  <tr className="border-b border-border bg-base text-meta uppercase tracking-[0.06em] text-text-subtle">
                    <th className="px-4 py-3 text-left font-semibold">Student</th>
                    <th className="px-4 py-3 text-right font-semibold">Results</th>
                    <th className="px-4 py-3 text-left font-semibold">Report card</th>
                    <th className="px-4 py-3 text-right font-semibold" />
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-border last:border-b-0 hover:bg-base transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-text">{s.name}</div>
                        <div className="text-meta text-text-subtle">
                          {s.admissionNo}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right text-text-muted">
                        <span className="font-medium text-text">
                          {s.resultsPublished}
                        </span>
                        <span className="text-meta text-text-subtle">
                          {" "}
                          / {s.resultsEntered}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {s.reportCard ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge tone={s.reportCard.published ? "success" : "neutral"}>
                              {s.reportCard.published ? "Published" : "Draft"}
                            </Badge>
                            {s.reportCard.pdfUrl && (
                              <span className="text-meta text-text-muted">
                                {s.reportCard.obtainedMarks}/{s.reportCard.totalMarks}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge tone="neutral">Not generated</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {s.reportCard?.pdfUrl && (
                          <a
                            href={s.reportCard.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-meta font-medium text-emerald hover:underline"
                          >
                            <Download className="h-3.5 w-3.5" aria-hidden /> PDF
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}