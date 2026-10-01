"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";

import { cn } from "@/lib/cn";

/**
 * Drag-and-drop file picker. Client-side validates extension & size before
 * accepting; the server (Server Action) re-validates with magic bytes.
 *
 * Usage:
 *   <FileDropzone
 *     name="file"            // name attribute on hidden <input>
 *     accept=".pdf,.docx"
 *     maxSizeBytes={10 * 1024 * 1024}
 *     value={file}           // File | null
 *     onChange={setFile}
 *     error={errors.file?.message}
 *   />
 */
interface FileDropzoneProps {
  name: string;
  accept?: string;
  maxSizeBytes?: number;
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  hint?: string;
  disabled?: boolean;
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileDropzone({
  name,
  accept = ".pdf,.docx",
  maxSizeBytes = 10 * 1024 * 1024,
  value,
  onChange,
  error,
  hint,
  disabled,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isOver, setIsOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validate = useCallback(
    (file: File): string | null => {
      if (accept) {
        const allowed = accept
          .split(",")
          .map((a) => a.trim().toLowerCase())
          .filter(Boolean);
        const dotExt = "." + (file.name.split(".").pop() ?? "").toLowerCase();
        const ok = allowed.some((a) => a === dotExt || a === file.type);
        if (!ok) {
          return `Only ${allowed.join(", ")} allowed`;
        }
      }
      if (file.size > maxSizeBytes) {
        return `File is too large (${formatBytes(file.size)}). Maximum ${formatBytes(maxSizeBytes)}.`;
      }
      if (file.size === 0) {
        return "File is empty";
      }
      return null;
    },
    [accept, maxSizeBytes],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const f = files[0];
      const err = validate(f);
      if (err) {
        setLocalError(err);
        onChange(null);
        return;
      }
      setLocalError(null);
      onChange(f);
    },
    [validate, onChange],
  );

  return (
    <div className="space-y-1.5">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          if (disabled) return;
          e.preventDefault();
          setIsOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-card border-2 border-dashed bg-base p-6 transition-colors",
          disabled && "cursor-not-allowed opacity-50",
          !disabled && "cursor-pointer",
          isOver && "border-emerald bg-emerald-bg/40",
          !isOver && !error && !localError && "border-border hover:border-emerald",
          (error || localError) && "border-danger",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        {value ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-chip bg-emerald-bg text-emerald">
                <FileText className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-default font-medium text-text">{value.name}</p>
                <p className="text-meta text-text-subtle">{formatBytes(value.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                setLocalError(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="flex-none rounded-full p-1.5 text-text-subtle hover:bg-card hover:text-danger"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-chip bg-emerald-bg text-emerald">
              <UploadCloud className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-default font-medium text-text">
              Drop file here or <span className="text-emerald">click to browse</span>
            </p>
            <p className="text-meta text-text-subtle">
              {accept.replaceAll(".", "").toUpperCase()} · max {formatBytes(maxSizeBytes)}
            </p>
          </div>
        )}
      </div>

      {(error || localError || hint) && (
        <p
          className={cn(
            "text-meta",
            (error || localError) ? "text-danger" : "text-text-subtle",
          )}
        >
          {error || localError || hint}
        </p>
      )}
    </div>
  );
}