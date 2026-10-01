"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";

import Button from "@/components/ui/Button";
import FileDropzone from "@/components/uploads/FileDropzone";
import { useToast } from "@/contexts/ToastContext";
import { submitWork } from "@/lib/actions/assessments";

interface SubmissionUploaderProps {
  assessmentId: string;
  allowResub: boolean;
  /** True when a previous attempt exists and the form should read as "resubmit". */
  hasExisting: boolean;
}

export default function SubmissionUploader({
  assessmentId,
  allowResub,
  hasExisting,
}: SubmissionUploaderProps) {
  const router = useRouter();
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit() {
    if (!file) {
      setError("Pick a file first");
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.set("assessmentId", assessmentId);
    fd.set("file", file);
    startTransition(async () => {
      const res = await submitWork(fd);
      if (!res.ok) {
        setError(res.error);
        toast.error({ title: "Upload failed", description: res.error });
        return;
      }
      toast.success({
        title: res.data.isLate ? "Submitted (late)" : "Submitted",
        description: `Attempt ${res.data.attempt}`,
      });
      router.refresh();
    });
  }

  const disabledReason = !allowResub && hasExisting
    ? "Resubmissions are not allowed for this assessment."
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-default">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-chip bg-emerald-bg text-emerald">
          <UploadCloud className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="font-medium text-text">
            {hasExisting ? "Resubmit your work" : "Upload your submission"}
          </p>
          <p className="text-meta text-text-subtle">
            PDF or DOCX, max 10MB.
          </p>
        </div>
      </div>

      <FileDropzone
        name="file"
        accept=".pdf,.docx"
        value={file}
        onChange={(f) => {
          setFile(f);
          setError(null);
        }}
        disabled={Boolean(disabledReason)}
        error={error ?? undefined}
      />

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={onSubmit}
          loading={pending}
          disabled={Boolean(disabledReason)}
        >
          {hasExisting ? "Resubmit" : "Submit"}
        </Button>
      </div>

      {disabledReason && (
        <p className="text-meta text-text-subtle">{disabledReason}</p>
      )}
    </div>
  );
}