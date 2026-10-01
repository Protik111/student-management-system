import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { requirePermission } from "@/lib/auth-helpers";
import { getCourse } from "@/lib/actions/courses";
import { listMaterialsForCourse } from "@/lib/actions/materials";
import { listEnrollmentsForCourse } from "@/lib/actions/course-enrollments";
import { listEligibleStudents } from "@/lib/actions/courses";
import { can } from "@/lib/rbac";
import MaterialsPanel from "@/components/courses/MaterialsPanel";
import EnrollmentTable from "@/components/courses/EnrollmentTable";
import AddStudentDialog from "@/components/courses/AddStudentDialog";

export const metadata = { title: "Course · Admin" };

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await requirePermission("manage_courses");
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) notFound();

  const [materials, enrollments, eligible] = await Promise.all([
    listMaterialsForCourse(id),
    listEnrollmentsForCourse(id),
    listEligibleStudents(id),
  ]);

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        href="/admin/courses"
        className="-ml-3"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to courses
      </Button>

      <PageHeader
        title={course.title}
        description={course.description}
        actions={
          <>
            <Badge tone={course.isActive ? "success" : "neutral"}>
              {course.isActive ? "Active" : "Inactive"}
            </Badge>
            <Button
              variant="outline"
              href={`/admin/courses/${course.id}/edit`}
            >
              Edit
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-card border border-border bg-card p-4">
          <p className="text-meta uppercase tracking-[0.06em] text-text-subtle">
            Category
          </p>
          <p className="mt-1 text-default font-medium text-text">
            {course.categoryName}
          </p>
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <p className="text-meta uppercase tracking-[0.06em] text-text-subtle">
            Teacher
          </p>
          <p className="mt-1 text-default font-medium text-text">
            {course.teacherName}
          </p>
        </div>
        <div className="rounded-card border border-border bg-card p-4">
          <p className="text-meta uppercase tracking-[0.06em] text-text-subtle">
            Price
          </p>
          <p className="mt-1 text-default font-medium text-text">
            {course.priceCents === 0
              ? "Free"
              : `${(course.priceCents / 100).toFixed(2)}`}
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-card-title font-semibold text-text">
            Enrolled students ({enrollments.length})
          </h2>
          {can(me.role, "add_student_to_course") && (
            <AddStudentDialog courseId={course.id} students={eligible} />
          )}
        </div>
        <EnrollmentTable courseId={course.id} rows={enrollments} scope="ADMIN" />
      </section>

      <MaterialsPanel
        courseId={course.id}
        materials={materials}
        canUpload={can(me.role, "manage_materials")}
        canDelete={() => can(me.role, "delete_any_material")}
        readOnly={false}
      />
    </div>
  );
}