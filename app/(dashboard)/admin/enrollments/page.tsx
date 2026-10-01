import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { requirePermission } from "@/lib/auth-helpers";
import { listAllEnrollments } from "@/lib/actions/course-enrollments";

export const metadata = { title: "Course Enrollments · Admin" };

export default async function AdminCourseEnrollmentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  await requirePermission("view_course_enrollments");
  const params = (await searchParams) ?? {};
  const page = Math.max(1, Number(params.page) || 1);
  const result = await listAllEnrollments({ page, pageSize: 25 });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course enrollments"
        description="Every student-to-course enrollment — both self-enrolled and added by staff."
      />

      {result.rows.length === 0 ? (
        <EmptyState
          title="No enrollments yet"
          description="When students enroll in courses, they'll show up here."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-default">
            <thead>
              <tr className="border-b border-border text-meta uppercase tracking-[0.06em] text-text-subtle">
                <th className="px-4 py-3 text-left font-semibold">Course</th>
                <th className="px-4 py-3 text-left font-semibold">Student</th>
                <th className="px-4 py-3 text-left font-semibold">Source</th>
                <th className="px-4 py-3 text-left font-semibold">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-border last:border-b-0 hover:bg-base transition-colors"
                >
                  <td className="px-4 py-3.5 font-medium text-text">
                    {r.courseTitle}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-text">{r.studentName}</div>
                    <div className="text-meta text-text-subtle">
                      {r.studentEmail}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge tone={r.source === "enrolled" ? "info" : "warning"}>
                      {r.source === "enrolled" ? "Self-enrolled" : "Added"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-text-muted">
                    {r.enrolledAt.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}