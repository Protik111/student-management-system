import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { requirePermission } from "@/lib/auth-helpers";
import { getCourse } from "@/lib/actions/courses";
import { listMaterialsForCourse } from "@/lib/actions/materials";
import EnrollButton from "@/components/courses/EnrollButton";
import MaterialsPanel from "@/components/courses/MaterialsPanel";

export const metadata = { title: "Course · Student" };

export default async function StudentCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("view_courses");
  const { id } = await params;
  const course = await getCourse(id);
  if (!course) notFound();

  const materials = course.isEnrolled
    ? await listMaterialsForCourse(id)
    : [];

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        href="/student/browse"
        className="-ml-3"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to browse
      </Button>

      <PageHeader
        title={course.title}
        description={course.description}
        actions={
          course.isEnrolled ? (
            <Badge tone="success">Enrolled</Badge>
          ) : course.isActive ? (
            <EnrollButton courseId={course.id} />
          ) : (
            <Badge tone="neutral">Inactive</Badge>
          )
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

      {!course.isEnrolled && course.isActive && (
        <Card>
          <p className="text-default text-text-muted">
            Enroll to unlock the materials shared by your teacher.
          </p>
          <div className="mt-3">
            <EnrollButton courseId={course.id} />
          </div>
        </Card>
      )}

      {course.isEnrolled ? (
        <MaterialsPanel
          courseId={course.id}
          materials={materials}
          canUpload={false}
          canDelete={() => false}
          readOnly
        />
      ) : (
        <Card>
          <p className="text-default text-text-muted">
            <Link
              href="/student/browse"
              className="font-medium text-emerald hover:underline"
            >
              Browse more courses
            </Link>
          </p>
        </Card>
      )}
    </div>
  );
}