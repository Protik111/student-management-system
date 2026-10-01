import Link from "next/link";
import { requirePermission } from "@/lib/auth-helpers";
import {
  listExamSubjectsForGrading,
  listExamsForTeacher,
  listStudentsForExamSubject,
  type TeacherExamOption,
} from "@/lib/actions/results";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import ResultsGradingTable from "@/components/results/ResultsGradingTable";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ examId?: string; subjectId?: string }>;
}

export default async function TeacherResultsPage({
  searchParams,
}: PageProps) {
  await requirePermission("enter_results");
  const { examId, subjectId } = await searchParams;

  const exams = await listExamsForTeacher();
  const currentExam: TeacherExamOption | undefined = examId
    ? exams.find((e) => e.id === examId)
    : exams[0];
  const subjects = currentExam
    ? await listExamSubjectsForGrading(currentExam.id)
    : [];
  const currentSubject = subjectId
    ? subjects.find((s) => s.id === subjectId)
    : subjects[0];
  const rows = currentSubject
    ? await listStudentsForExamSubject(currentSubject.id)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enter Results"
        description="Pick an exam, then enter marks for each subject's students. Publish individual results or the whole sheet."
      />

      {exams.length === 0 ? (
        <EmptyState
          title="No exams yet"
          description="Create an exam in the Exams module first."
        />
      ) : (
        <Card className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <ExamPicker
              label="Exam"
              currentId={currentExam?.id ?? ""}
              exams={exams}
              paramName="examId"
            />
            <ExamPicker
              label="Subject / Class"
              currentId={currentSubject?.id ?? ""}
              exams={subjects.map((s) => ({
                id: s.id,
                name: `${s.subjectName} — ${s.className}${s.classSection ? ` – ${s.classSection}` : ""}`,
                term: "",
                academicYear: "",
                subjectCount: 0,
              }))}
              paramName="subjectId"
              disabled={!currentExam}
              extraParam={currentExam ? { examId: currentExam.id } : undefined}
            />
          </div>
        </Card>
      )}

      {currentSubject && (
        <ResultsGradingTable
          rows={rows}
          examSubjectId={currentSubject.id}
          examName={`${currentExam?.name ?? ""} — ${currentSubject.subjectName} (${currentSubject.className}${currentSubject.classSection ? ` – ${currentSubject.classSection}` : ""})`}
        />
      )}
    </div>
  );
}

function ExamPicker({
  label,
  currentId,
  exams,
  paramName,
  disabled,
  extraParam,
}: {
  label: string;
  currentId: string;
  exams: { id: string; name: string; term?: string; academicYear?: string; subjectCount?: number }[];
  paramName: string;
  disabled?: boolean;
  extraParam?: Record<string, string>;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-meta font-semibold uppercase tracking-[0.06em] text-text-subtle">
        {label}
      </p>
      {exams.length === 0 ? (
        <p className="text-default text-text-muted">—</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {exams.map((e) => {
            const params = new URLSearchParams();
            params.set(paramName, e.id);
            if (extraParam) {
              for (const [k, v] of Object.entries(extraParam)) params.set(k, v);
            }
            const isActive = e.id === currentId;
            return (
              <Link
                key={e.id}
                href={`/teacher/results?${params.toString()}`}
                aria-disabled={disabled}
                className={`inline-flex items-center rounded-chip border px-3 py-1.5 text-meta font-medium transition-colors ${
                  isActive
                    ? "border-emerald bg-emerald-bg text-emerald"
                    : "border-border bg-card text-text hover:border-emerald hover:text-emerald"
                } ${disabled ? "pointer-events-none opacity-50" : ""}`}
              >
                {e.name}
                {e.term && (
                  <span className="ml-1.5 text-meta text-text-subtle">
                    ({e.term}, {e.academicYear})
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}