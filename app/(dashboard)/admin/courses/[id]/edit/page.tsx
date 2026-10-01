import { notFound } from "next/navigation";

import CourseForm from "@/components/courses/CourseForm";
import { requirePermission } from "@/lib/auth-helpers";
import { getCourse } from "@/lib/actions/courses";
import { listCategories } from "@/lib/actions/categories";
import { listTeachersForSelect } from "@/lib/actions/courses";

export const metadata = { title: "Edit course · Admin" };

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("manage_courses");
  const { id } = await params;
  const [course, categories, teachers] = await Promise.all([
    getCourse(id),
    listCategories(),
    listTeachersForSelect(),
  ]);
  if (!course) notFound();

  return (
    <CourseForm
      scope="ADMIN"
      categories={categories}
      teachers={teachers}
      initial={{
        id: course.id,
        title: course.title,
        description: course.description,
        categoryId: course.categoryId,
        teacherId: course.teacherId,
        priceCents: course.priceCents,
        isActive: course.isActive,
      }}
      redirectTo={`/admin/courses/${course.id}`}
    />
  );
}