import { requirePermission } from "@/lib/auth-helpers";
import CourseForm from "@/components/courses/CourseForm";
import { listCategories } from "@/lib/actions/categories";
import { listTeachersForSelect } from "@/lib/actions/courses";

export const metadata = { title: "New course · Admin" };

export default async function NewCoursePage() {
  await requirePermission("manage_courses");
  const [categories, teachers] = await Promise.all([
    listCategories(),
    listTeachersForSelect(),
  ]);
  return (
    <CourseForm
      scope="ADMIN"
      categories={categories}
      teachers={teachers}
      redirectTo="/admin/courses"
    />
  );
}