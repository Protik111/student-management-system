import { requirePermission } from "@/lib/auth-helpers";
import CourseList from "@/components/courses/CourseList";
import { listMyCourses } from "@/lib/actions/courses";
import { listCategories } from "@/lib/actions/categories";

export const metadata = { title: "My Courses · Teacher" };

export default async function TeacherCoursesPage() {
  await requirePermission("manage_courses");
  const [rows, categories] = await Promise.all([
    listMyCourses(),
    listCategories(),
  ]);
  return (
    <CourseList
      scope="TEACHER"
      initialRows={rows}
      total={rows.length}
      page={1}
      pageSize={rows.length || 1}
      categories={categories}
      hrefBase="/teacher"
      canCreate
    />
  );
}