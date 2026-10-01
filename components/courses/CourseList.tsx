"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LinkComp from "next/link";
import { Plus, Search } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import AppSelect from "@/components/ui/AppSelect";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/contexts/ToastContext";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import {
  type CourseListItem,
  deleteCourse,
  toggleCourseActive,
} from "@/lib/actions/courses";
import type { CategoryListItem } from "@/lib/actions/categories";
import SearchInput from "@/components/admin/shared/SearchInput";

interface CourseListProps {
  /** "ADMIN" / "TEACHER" / "STUDENT" — drives header copy, links, and CTA visibility. */
  scope: "ADMIN" | "TEACHER" | "STUDENT";
  initialRows: CourseListItem[];
  total: number;
  page: number;
  pageSize: number;
  categories: CategoryListItem[];
  /** Path prefix used to build course detail/edit links. */
  hrefBase: "/admin" | "/teacher" | "/student";
  /** Whether the "New course" CTA is shown. */
  canCreate: boolean;
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title-asc", label: "Title (A→Z)" },
  { value: "title-desc", label: "Title (Z→A)" },
  { value: "price-asc", label: "Price (low→high)" },
  { value: "price-desc", label: "Price (high→low)" },
];

function formatPrice(priceCents: number): string {
  if (priceCents === 0) return "Free";
  return `${(priceCents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function CourseList({
  scope,
  initialRows,
  total,
  page,
  pageSize,
  categories,
  hrefBase,
  canCreate,
}: CourseListProps) {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "newest");
  const [categoryId, setCategoryId] = useState(
    searchParams.get("categoryId") ?? "",
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q && !categoryId) return initialRows;
    return initialRows.filter((c) => {
      if (categoryId && c.categoryId !== categoryId) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.categoryName.toLowerCase().includes(q) ||
        c.teacherName.toLowerCase().includes(q)
      );
    });
  }, [initialRows, search, categoryId]);

  function updateUrl(next: {
    q?: string;
    sort?: string;
    categoryId?: string;
    page?: number;
  }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }
    if (next.sort !== undefined) {
      if (next.sort && next.sort !== "newest") params.set("sort", next.sort);
      else params.delete("sort");
    }
    if (next.categoryId !== undefined) {
      if (next.categoryId) params.set("categoryId", next.categoryId);
      else params.delete("categoryId");
    }
    if (next.page !== undefined) {
      if (next.page > 1) params.set("page", String(next.page));
      else params.delete("page");
    }
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
    });
  }

  const del = useConfirmAction<CourseListItem>({
    title: (c) => `Delete "${c.title}"?`,
    description: (c) =>
      `${c.enrollmentCount} enrollment(s) and ${c.materialCount} material(s) will be removed. This cannot be undone.`,
    confirmText: "Delete course",
    variant: "danger",
    successTitle: "Course deleted",
    action: async (c) => {
      const r = await deleteCourse(c.id);
      if (!r.ok) throw new Error(r.error);
    },
    onSuccess: () => router.refresh(),
  });

  const toggle = useConfirmAction<CourseListItem>({
    title: (c) => (c.isActive ? "Deactivate course?" : "Activate course?"),
    description: (c) =>
      c.isActive
        ? `Students will no longer see "${c.title}" in the marketplace.`
        : `Students will see "${c.title}" in the marketplace again.`,
    confirmText: "Continue",
    variant: "danger",
    successTitle: (c) => (c.isActive ? "Course deactivated" : "Course activated"),
    action: async (c) => {
      const r = await toggleCourseActive(c.id);
      if (!r.ok) throw new Error(r.error);
    },
    onSuccess: () => router.refresh(),
  });

  const categoryOptions = [
    { value: "", label: "All categories" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={scope === "STUDENT" ? "Browse courses" : "Courses"}
        description={
          scope === "ADMIN"
            ? "Every course in your school — manage categories, teachers, and pricing."
            : scope === "TEACHER"
              ? "Courses you teach."
              : "Find your next course."
        }
        actions={
          <>
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                updateUrl({ q: v, page: 1 });
              }}
              placeholder="Search courses…"
            />
            {scope !== "STUDENT" && (
              <AppSelect
                options={categoryOptions}
                value={categoryId}
                onValueChange={(v) => {
                  setCategoryId(v);
                  updateUrl({ categoryId: v, page: 1 });
                }}
                className="w-56"
                placeholder="Filter by category"
              />
            )}
            <AppSelect
              options={SORT_OPTIONS}
              value={sort}
              onValueChange={(v) => {
                setSort(v);
                updateUrl({ sort: v });
              }}
              className="w-48"
              placeholder="Sort by"
            />
            {canCreate && (
              <Button href={`${hrefBase}/courses/new`}>
                <Plus className="h-4 w-4" aria-hidden /> New course
              </Button>
            )}
          </>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          title={total === 0 ? "No courses yet" : "No courses match your filters"}
          description={
            total === 0
              ? canCreate
                ? "Create your first course to start building a catalogue."
                : "When courses are published, they'll appear here."
              : "Try clearing your search or filters."
          }
          action={
            canCreate && total === 0 ? (
              <Button href={`${hrefBase}/courses/new`}>
                <Plus className="h-4 w-4" aria-hidden /> Create your first course
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-default">
              <thead>
                <tr className="border-b border-border text-meta uppercase tracking-[0.06em] text-text-subtle">
                  <th className="px-4 py-3 text-left font-semibold">Course</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Teacher</th>
                  <th className="px-4 py-3 text-right font-semibold">Price</th>
                  <th className="px-4 py-3 text-right font-semibold">Enrolled</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border last:border-b-0 hover:bg-base transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <LinkComp
                        href={`${hrefBase}/courses/${c.id}`}
                        className="font-medium text-text hover:text-emerald"
                      >
                        {c.title}
                      </LinkComp>
                      <div className="mt-1 line-clamp-2 text-meta text-text-subtle">
                        {c.description}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-text-muted">{c.categoryName}</td>
                    <td className="px-4 py-3.5 text-text-muted">{c.teacherName}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-text-muted">
                      {formatPrice(c.priceCents)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-text-muted">
                      {c.enrollmentCount}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={c.isActive ? "success" : "neutral"}>
                        {c.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-2">
                        {scope === "STUDENT" ? (
                          <Button size="sm" variant="outline" href={`${hrefBase}/courses/${c.id}`}>
                            View
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              href={`${hrefBase}/courses/${c.id}`}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant={c.isActive ? "ghost" : "secondary"}
                              onClick={() => toggle.confirm(c)}
                              disabled={pending}
                            >
                              {c.isActive ? "Deactivate" : "Activate"}
                            </Button>
                            {scope === "ADMIN" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => del.confirm(c)}
                                disabled={pending}
                              >
                                Delete
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-meta text-text-muted">
              <p>
                Page {page} of {totalPages} · {total} course{total === 1 ? "" : "s"}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => updateUrl({ page: page - 1 })}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => updateUrl({ page: page + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog {...del.dialogProps} />
      <ConfirmDialog {...toggle.dialogProps} />
    </div>
  );
}

// Re-export so callers can reuse the icon without another import.
export { Search };