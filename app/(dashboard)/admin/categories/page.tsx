import { requirePermission } from "@/lib/auth-helpers";
import { listCategories } from "@/lib/actions/categories";
import CategoryManager from "@/components/courses/CategoryManager";

export const metadata = { title: "Categories · Admin" };

export default async function AdminCategoriesPage() {
  await requirePermission("manage_categories");
  const categories = await listCategories();
  return <CategoryManager initialCategories={categories} />;
}