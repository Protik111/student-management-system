import { requirePermission } from "@/lib/auth-helpers";
import CourseForm from "@/components/courses/CourseForm";
import { listCategoriesForSelect } from "@/lib/actions/categories";

export const metadata = { title: "New course · Teacher" };

export default async function NewTeacherCoursePage() {
  await requirePermission("manage_courses");
  const categories = await listCategoriesForSelect();
  return (
    <CourseForm
      scope="TEACHER"
      categories={categories}
      teachers={[]}
      redirectTo="/teacher/courses"
    />
  );
}