import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Local-disk file uploads. Files land under `/public/uploads/<bucket>/<id>.<ext>`
 * and are served by Next.js's static handler, so the URL we return is the
 * relative path (e.g. `/uploads/submissions/abc123.pdf`).
 *
 * The PDF mandates these upload paths:
 *  - Assessment submissions (PDF or DOCX, ≤10MB)
 *  - Generated report cards (PDF, server-rendered)
 *  - Course materials (PDF/DOCX ≤10MB, images ≤25MB, videos ≤200MB)
 *
 * All share the same write/validate helpers so we have one place to enforce
 * size limits and magic-byte checks. Materials use the same entry points.
 */

/** Bytes that identify a real PDF (%PDF-). */
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d]; // "%PDF-"

/** Bytes that identify a DOCX (which is a ZIP container: PK\x03\x04). */
const DOCX_MAGIC = [0x50, 0x4b, 0x03, 0x04];

/** Bytes that identify a JPEG (FF D8 FF). */
const JPEG_MAGIC = [0xff, 0xd8, 0xff];

/** Bytes that identify a PNG (89 50 4E 47 0D 0A 1A 0A). */
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Bytes that identify a GIF (47 49 46 38). */
const GIF_MAGIC = [0x47, 0x49, 0x46, 0x38];

/** Bytes that identify a WEBP: RIFF at 0, WEBP at 8. */
const WEBP_HEAD = [0x52, 0x49, 0x46, 0x46]; // "RIFF"
const WEBP_TAIL = [0x57, 0x45, 0x42, 0x50]; // "WEBP"

/** Bytes that identify MP4/MOV/WEBM: 'ftyp' at offset 4. */
const FTYP_AT_4 = [0x66, 0x74, 0x79, 0x70]; // "ftyp"

export const MAX_BYTES = {
  doc: 10 * 1024 * 1024, // 10MB
  image: 25 * 1024 * 1024, // 25MB
  video: 200 * 1024 * 1024, // 200MB
} as const;

const ALLOWED_EXTENSIONS = [
  "pdf",
  "docx",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "mp4",
  "webm",
  "mov",
] as const;
export type UploadExtension = (typeof ALLOWED_EXTENSIONS)[number];
export type UploadKind = "doc" | "image" | "video";

export function kindFor(ext: UploadExtension): UploadKind {
  if (ext === "pdf" || ext === "docx") return "doc";
  if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "gif" || ext === "webp")
    return "image";
  return "video";
}

const EXT_TO_MIME: Record<UploadExtension, string[]> = {
  pdf: ["application/pdf"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",
  ],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  gif: ["image/gif"],
  webp: ["image/webp"],
  mp4: ["video/mp4"],
  webm: ["video/webm"],
  mov: ["video/quicktime"],
};

const EXT_TO_MAGIC: Record<UploadExtension, number[]> = {
  pdf: PDF_MAGIC,
  docx: DOCX_MAGIC,
  jpg: JPEG_MAGIC,
  jpeg: JPEG_MAGIC,
  png: PNG_MAGIC,
  gif: GIF_MAGIC,
  webp: WEBP_HEAD, // checked specially
  mp4: FTYP_AT_4,  // checked specially (offset 4)
  webm: FTYP_AT_4,
  mov: FTYP_AT_4,
};

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

function extFromName(name: string): UploadExtension {
  const ext = name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext as UploadExtension)) {
    throw new UploadValidationError(
      `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
    );
  }
  return ext as UploadExtension;
}

function startsWith(buf: Uint8Array, prefix: readonly number[]): boolean {
  if (buf.length < prefix.length) return false;
  for (let i = 0; i < prefix.length; i++) {
    if (buf[i] !== prefix[i]) return false;
  }
  return true;
}

function bytesAtOffsetMatch(
  buf: Uint8Array,
  offset: number,
  pattern: readonly number[],
): boolean {
  if (buf.length < offset + pattern.length) return false;
  for (let i = 0; i < pattern.length; i++) {
    if (buf[offset + i] !== pattern[i]) return false;
  }
  return true;
}

/**
 * Validate a file upload. Checks extension, declared MIME, size, and
 * magic bytes. Returns the resolved extension.
 */
export function validateUpload(
  file: { name: string; size: number; type: string; arrayBuffer(): Promise<ArrayBuffer> },
): Promise<{ ext: UploadExtension; bytes: Uint8Array }> {
  return (async () => {
    if (file.size <= 0) {
      throw new UploadValidationError("File is empty");
    }
    const ext = extFromName(file.name);
    const kind = kindFor(ext);
    const cap = MAX_BYTES[kind];
    if (file.size > cap) {
      throw new UploadValidationError(
        `File is too large. Maximum ${Math.round(cap / (1024 * 1024))}MB allowed for ${kind} files.`,
      );
    }

    const allowedMimes = EXT_TO_MIME[ext];
    if (file.type && !allowedMimes.includes(file.type)) {
      if (file.type !== "application/octet-stream") {
        throw new UploadValidationError(
          `File type "${file.type}" does not match extension .${ext}`,
        );
      }
    }

    const buf = new Uint8Array(await file.arrayBuffer());

    // WEBP: RIFF at 0, WEBP at 8
    if (ext === "webp") {
      if (
        !startsWith(buf, WEBP_HEAD) ||
        !bytesAtOffsetMatch(buf, 8, WEBP_TAIL)
      ) {
        throw new UploadValidationError(
          "File content does not look like a real .webp file",
        );
      }
    } else if (ext === "mp4" || ext === "webm" || ext === "mov") {
      // MP4/WEBM/MOV: 'ftyp' at offset 4
      if (!bytesAtOffsetMatch(buf, 4, FTYP_AT_4)) {
        throw new UploadValidationError(
          `File content does not look like a real .${ext} file`,
        );
      }
    } else if (!startsWith(buf, EXT_TO_MAGIC[ext])) {
      throw new UploadValidationError(
        `File content does not look like a real .${ext} file`,
      );
    }
    return { ext, bytes: buf };
  })();
}

/**
 * Save a validated upload to disk. Returns the public URL.
 *
 *   bucket: e.g. "submissions" | "report-cards" | "materials"
 *   prefix: e.g. assessment id (used as a sub-folder)
 */
export async function saveUpload(
  bytes: Uint8Array,
  ext: UploadExtension,
  bucket: string,
  prefix?: string,
): Promise<string> {
  const id = randomUUID();
  const parts = ["uploads", bucket];
  if (prefix) parts.push(prefix);
  parts.push(`${id}.${ext}`);
  const relPath = parts.join("/");
  const absPath = path.join(process.cwd(), "public", relPath);

  await mkdir(path.dirname(absPath), { recursive: true });
  await writeFile(absPath, bytes);

  return "/" + relPath;
}

/** Convenience for Server Actions: pull the first file out of FormData. */
export async function readFormFile(formData: FormData, fieldName: string): Promise<File | null> {
  const f = formData.get(fieldName);
  if (!f || typeof f === "string") return null;
  return f as File;
}

export const UPLOAD_LIMITS = {
  maxBytes: MAX_BYTES,
  allowedExtensions: ALLOWED_EXTENSIONS,
} as const;
