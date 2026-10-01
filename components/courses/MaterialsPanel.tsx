import { Download, File as FileIcon, Image as ImageIcon, Video } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import {
  type MaterialListItem,
  deleteMaterial,
} from "@/lib/actions/materials";
import MaterialUploadDialog from "@/components/courses/MaterialUploadDialog";

interface MaterialsPanelProps {
  courseId: string;
  materials: MaterialListItem[];
  canUpload: boolean;
  canDelete: (material: MaterialListItem) => boolean;
  /** When true, render only the read-only list (no upload / delete controls). */
  readOnly: boolean;
}

function pickIcon(mime: string) {
  if (mime.startsWith("image/")) return ImageIcon;
  if (mime.startsWith("video/")) return Video;
  return FileIcon;
}

function humanBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default async function MaterialsPanel({
  courseId,
  materials,
  canUpload,
  canDelete,
  readOnly,
}: MaterialsPanelProps) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-card-title font-semibold text-text">Materials</h2>
          <p className="mt-1 text-meta text-text-subtle">
            {materials.length === 0
              ? "No materials uploaded yet."
              : `${materials.length} item${materials.length === 1 ? "" : "s"}.`}
          </p>
        </div>
        {canUpload && <MaterialUploadDialog courseId={courseId} />}
      </div>

      {materials.length === 0 ? (
        <EmptyState
          title="No materials yet"
          description={
            readOnly
              ? "Materials will appear here once your teacher uploads them."
              : "Add your first file — PDFs, images, or videos."
          }
        />
      ) : (
        <ul className="space-y-2">
          {materials.map((m) => {
            const Icon = pickIcon(m.mimeType);
            const deletable = !readOnly && canDelete(m);
            return (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-chip border border-border bg-card px-3 py-2.5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-chip bg-emerald-bg text-emerald">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <a
                    href={m.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate font-medium text-text hover:text-emerald hover:underline"
                  >
                    {m.fileName}
                  </a>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-meta text-text-subtle">
                    <Badge tone="neutral">{humanBytes(m.fileBytes)}</Badge>
                    <span>by {m.uploadedByName}</span>
                    <span>· {m.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
                <a
                  href={m.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-chip border border-transparent bg-transparent px-3 py-1.5 text-meta font-medium text-text-muted hover:bg-base hover:text-text"
                  aria-label={`Download ${m.fileName}`}
                >
                  <Download className="h-4 w-4" aria-hidden />
                </a>
                {deletable && (
                  <form
                    action={async () => {
                      "use server";
                      await deleteMaterial(m.id);
                    }}
                  >
                    <Button size="sm" variant="ghost" type="submit">
                      Delete
                    </Button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}