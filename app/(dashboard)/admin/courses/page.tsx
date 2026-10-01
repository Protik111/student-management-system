import { requirePermission } from "@/lib/auth-helpers";
import CourseList from "@/components/courses/CourseList";
import { listCourses } from "@/lib/actions/courses";
import { listCategories } from "@/lib/actions/categories";

export const metadata = { title: "Courses · Admin" };

const PAGE_SIZE = 20;

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    sort?: string;
    page?: string;
    categoryId?: string;
  }>;
}) {
  await requirePermission("manage_courses");
  const params = (await searchParams) ?? {};
  const page = Math.max(1, Number(params.page) || 1);
  const result = await listCourses({
    q: params.q,
    sort: (params.sort as never) ?? "newest",
    page,
    pageSize: PAGE_SIZE,
    categoryId: params.categoryId,
  });
  const categories = await listCategories();

  return (
    <CourseList
      scope="ADMIN"
      initialRows={result.rows}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      categories={categories}
      hrefBase="/admin"
      canCreate
    />
  );
}