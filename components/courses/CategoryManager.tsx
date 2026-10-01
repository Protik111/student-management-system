"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useConfirmAction } from "@/hooks/useConfirmAction";
import { useToast } from "@/contexts/ToastContext";
import {
  categoryCreateSchema,
  type CategoryCreateInput,
} from "@/lib/actions/schemas";
import {
  type CategoryListItem,
  createCategory,
  deleteCategory,
} from "@/lib/actions/categories";

interface CategoryManagerProps {
  initialCategories: CategoryListItem[];
}

export default function CategoryManager({
  initialCategories,
}: CategoryManagerProps) {
  const router = useRouter();
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryCreateInput>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: { name: "", code: "", description: "" },
  });

  async function onCreate(values: CategoryCreateInput) {
    setSubmitting(true);
    const r = await createCategory({
      name: values.name,
      code: values.code,
      description: values.description || "",
    });
    setSubmitting(false);
    if (!r.ok) {
      toast.error({ title: "Couldn't create category", description: r.error });
      return;
    }
    toast.success({ title: "Category created" });
    reset();
    setCreating(false);
    router.refresh();
  }

  const del = useConfirmAction<CategoryListItem>({
    title: (c) => `Delete "${c.name}"?`,
    description: (c) =>
      c.courseCount > 0
        ? `Category has ${c.courseCount} course(s) attached. Move or delete them first.`
        : "This action cannot be undone.",
    confirmText: "Delete",
    variant: "danger",
    successTitle: "Category deleted",
    action: async (c) => {
      const r = await deleteCategory(c.id);
      if (!r.ok) throw new Error(r.error);
    },
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course categories"
        description="Organise the catalogue. Each category belongs to your school."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" aria-hidden /> New category
          </Button>
        }
      />

      {initialCategories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Create your first category to start grouping courses."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" aria-hidden /> Add your first category
            </Button>
          }
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-default">
            <thead>
              <tr className="border-b border-border text-meta uppercase tracking-[0.06em] text-text-subtle">
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Code</th>
                <th className="px-4 py-3 text-left font-semibold">Description</th>
                <th className="px-4 py-3 text-right font-semibold">Courses</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialCategories.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-4 py-3.5 font-medium text-text">{c.name}</td>
                  <td className="px-4 py-3.5 font-mono text-meta text-text-muted">
                    {c.code}
                  </td>
                  <td className="px-4 py-3.5 text-text-muted">
                    {c.description ?? (
                      <span className="text-meta text-text-subtle">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right text-text-muted">
                    {c.courseCount}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={c.courseCount > 0}
                      onClick={() => del.confirm(c)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <ConfirmDialog {...del.dialogProps} />

      {creating && (
        <Modal
          open
          onClose={() => (submitting ? undefined : setCreating(false))}
          title="New category"
        >
          <form onSubmit={handleSubmit(onCreate)} className="space-y-4" noValidate>
            <Input
              label="Name"
              placeholder="e.g. Mathematics"
              required
              autoFocus
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="Code"
              placeholder="MATH"
              required
              hint="Short identifier — letters, numbers, dashes."
              error={errors.code?.message}
              {...register("code")}
            />
            <Input
              label="Description"
              placeholder="Optional context for this category"
              error={errors.description?.message}
              {...register("description")}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setCreating(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Create category
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}