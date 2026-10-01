import { requirePermission } from "@/lib/auth-helpers";
import CourseList from "@/components/courses/CourseList";
import { listMyCourses } from "@/lib/actions/courses";
import { listCategories } from "@/lib/actions/categories";

export const metadata = { title: "My Courses · Student" };

export default async function StudentCoursesPage() {
  await requirePermission("view_courses");
  const [rows, categories] = await Promise.all([
    listMyCourses(),
    listCategories(),
  ]);
  return (
    <CourseList
      scope="STUDENT"
      initialRows={rows}
      total={rows.length}
      page={1}
      pageSize={rows.length || 1}
      categories={categories}
      hrefBase="/student"
      canCreate={false}
    />
  );
}