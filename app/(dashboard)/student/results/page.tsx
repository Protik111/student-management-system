import { Download } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { listPublishedResultsForStudent } from "@/lib/actions/results";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import ClassificationBadge from "@/components/assessments/ClassificationBadge";
import Card from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function StudentResultsPage() {
  await requireRole("STUDENT");
  const groups = await listPublishedResultsForStudent();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Results"
        description="Every published exam and your marks per subject — once your teacher publishes, you'll see it here."
      />

      {groups.length === 0 ? (
        <EmptyState
          title="No published results yet"
          description="Marks become visible as soon as your teacher publishes them."
        />
      ) : (
        groups.map((g) => {
          const totalObtained = g.results.reduce(
            (acc, r) => acc + r.marksObtained,
            0,
          );
          const totalMax = g.results.reduce(
            (acc, r) => acc + r.maxMarks,
            0,
          );
          const pct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
          return (
            <section key={g.examId} className="space-y-3">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <h2 className="text-card-title font-semibold text-text">
                    {g.examName}
                  </h2>
                  <p className="text-meta text-text-subtle">
                    {g.term} · {g.academicYear}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone="info">
                    {totalObtained}/{totalMax}
                  </Badge>
                  <Badge tone={pct >= 70 ? "success" : pct >= 40 ? "info" : "danger"}>
                    {pct.toFixed(1)}%
                  </Badge>
                  {g.reportCard?.pdfUrl && g.reportCard.published && (
                    <a
                      href={g.reportCard.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-chip bg-emerald px-3 py-1.5 text-meta font-medium text-white hover:bg-emerald-light"
                    >
                      <Download className="h-4 w-4" aria-hidden /> Report card
                    </a>
                  )}
                </div>
              </header>

              <Card className="p-0 overflow-hidden">
                <table className="w-full text-default">
                  <thead>
                    <tr className="border-b border-border bg-base text-meta uppercase tracking-[0.06em] text-text-subtle">
                      <th className="px-4 py-3 text-left font-semibold">Subject</th>
                      <th className="px-4 py-3 text-right font-semibold">Marks</th>
                      <th className="px-4 py-3 text-center font-semibold">Grade</th>
                      <th className="px-4 py-3 text-left font-semibold">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.results.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-text">{r.subjectName}</div>
                          <div className="text-meta text-text-subtle">
                            {r.className}
                            {r.classSection && ` – ${r.classSection}`}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="font-medium text-text">
                            {r.marksObtained}
                          </span>
                          <span className="text-meta text-text-subtle">
                            {" "}
                            / {r.maxMarks}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {r.grade ? (
                            <ClassificationBadge
                              classification={
                                r.grade as "fail" | "pass" | "merit" | "distinction"
                              }
                            />
                          ) : (
                            <Badge tone="neutral">—</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-text-muted">
                          {r.remarks || (
                            <span className="text-meta text-text-subtle">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </section>
          );
        })
      )}
    </div>
  );
}