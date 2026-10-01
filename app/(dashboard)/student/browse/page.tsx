import { requirePermission } from "@/lib/auth-helpers";
import CourseList from "@/components/courses/CourseList";
import { listCourses } from "@/lib/actions/courses";
import { listCategories } from "@/lib/actions/categories";

export const metadata = { title: "Browse Courses · Student" };

const PAGE_SIZE = 20;

export default async function StudentBrowsePage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    sort?: string;
    page?: string;
    categoryId?: string;
  }>;
}) {
  await requirePermission("view_courses");
  const params = (await searchParams) ?? {};
  const page = Math.max(1, Number(params.page) || 1);
  const result = await listCourses({
    q: params.q,
    sort: (params.sort as never) ?? "newest",
    page,
    pageSize: PAGE_SIZE,
    categoryId: params.categoryId,
    isActive: true,
  });
  const categories = await listCategories();
  return (
    <CourseList
      scope="STUDENT"
      initialRows={result.rows}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      categories={categories}
      hrefBase="/student"
      canCreate={false}
    />
  );
}