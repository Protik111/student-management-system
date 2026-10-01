import { notFound } from "next/navigation";

import CourseForm from "@/components/courses/CourseForm";
import { requirePermission } from "@/lib/auth-helpers";
import { getCourse } from "@/lib/actions/courses";
import { listCategories } from "@/lib/actions/categories";

export const metadata = { title: "Edit course · Teacher" };

export default async function TeacherEditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("manage_courses");
  const { id } = await params;
  const [course, categories] = await Promise.all([
    getCourse(id),
    listCategories(),
  ]);
  if (!course) notFound();

  return (
    <CourseForm
      scope="TEACHER"
      categories={categories}
      teachers={[]}
      initial={{
        id: course.id,
        title: course.title,
        description: course.description,
        categoryId: course.categoryId,
        teacherId: course.teacherId,
        priceCents: course.priceCents,
        isActive: course.isActive,
      }}
      redirectTo={`/teacher/courses/${course.id}`}
    />
  );
}