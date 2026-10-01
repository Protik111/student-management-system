"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";
import { uploadMaterial } from "@/lib/actions/materials";

interface MaterialUploadDialogProps {
  courseId: string;
}

const ACCEPT =
  ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime";

const MAX_MB = { doc: 10, image: 25, video: 200 };

export default function MaterialUploadDialog({
  courseId,
}: MaterialUploadDialogProps) {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [chosen, setChosen] = useState<File | null>(null);

  function reset() {
    setChosen(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!chosen) {
      toast.error({ title: "Pick a file first" });
      return;
    }
    setSubmitting(true);
    const fd = new FormData();
    fd.set("courseId", courseId);
    fd.set("file", chosen);
    const r = await uploadMaterial(fd);
    setSubmitting(false);
    if (!r.ok) {
      toast.error({ title: "Upload failed", description: r.error });
      return;
    }
    toast.success({ title: "Material uploaded" });
    reset();
    setOpen(false);
    startTransition(() => router.refresh());
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" aria-hidden /> Upload material
      </Button>
      <Modal
        open={open}
        onClose={() => {
          if (submitting) return;
          reset();
          setOpen(false);
        }}
        title="Upload material"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <p className="text-default text-text-muted">
            PDFs and DOCX up to {MAX_MB.doc}MB · Images up to {MAX_MB.image}MB ·
            Videos up to {MAX_MB.video}MB.
          </p>
          <label
            htmlFor="material-file"
            className="block cursor-pointer rounded-card border border-dashed border-border-strong bg-base p-6 text-center hover:border-emerald"
          >
            <Upload
              className="mx-auto mb-2 h-6 w-6 text-text-muted"
              aria-hidden
            />
            <span className="block text-default font-medium text-text">
              {chosen ? chosen.name : "Click to choose a file"}
            </span>
            {chosen && (
              <span className="mt-1 block text-meta text-text-subtle">
                {(chosen.size / (1024 * 1024)).toFixed(2)} MB ·{" "}
                {chosen.type || "unknown type"}
              </span>
            )}
            <input
              ref={fileInputRef}
              id="material-file"
              name="file"
              type="file"
              accept={ACCEPT}
              required
              onChange={(e) => setChosen(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                reset();
                setOpen(false);
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting || pending}>
              Upload
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}