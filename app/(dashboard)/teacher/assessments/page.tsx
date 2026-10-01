import { requirePermission } from "@/lib/auth-helpers";
import AssessmentList, {
  type AssessmentRow,
} from "@/components/assessments/AssessmentList";
import { listAssessmentsForTeacher } from "@/lib/actions/assessments";

export const dynamic = "force-dynamic";

export default async function TeacherAssessmentsPage() {
  await requirePermission("manage_assessments");
  const list = await listAssessmentsForTeacher();
  const rows: AssessmentRow[] = list.map((a) => ({
    id: a.id,
    title: a.title,
    module: a.module,
    status: a.status,
    deadline: a.deadline,
    className: a.className,
    classSection: a.classSection,
    subjectName: a.subjectName,
    teacherName: a.teacherName,
    submissionCount: a.submissionCount,
    gradedCount: a.gradedCount,
  }));
  return <AssessmentList variant="teacher" assessments={rows} newHref="/teacher/assessments/new" />;
}