import { z } from "zod";

import { csvImportRowSchema, type CsvImportRow } from "@/lib/actions/schemas";

/**
 * Minimal CSV parser (handles RFC-4180 quoted fields, escaped quotes,
 * commas inside quotes, CRLF or LF line endings). We don't pull in
 * papaparse for this single use — the parser below is enough for
 * spreadsheet exports.
 */
function parseCsvText(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\n" || c === "\r") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
      // Swallow CRLF pair.
      if (c === "\r" && text[i + 1] === "\n") i += 2;
      else i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // Drop trailing empty row that often comes from a final newline.
  if (
    rows.length > 0 &&
    rows[rows.length - 1].length === 1 &&
    rows[rows.length - 1][0] === ""
  ) {
    rows.pop();
  }
  return rows;
}

/**
 * Map header row to canonical field names. Headers are case-insensitive;
 * spaces, hyphens, underscores are normalised to camelCase.
 */
function normaliseHeader(h: string): string {
  const s = h.trim().toLowerCase().replace(/[\s\-]+/g, "_");
  const map: Record<string, string> = {
    email: "email",
    full_name: "fullName",
    name: "fullName",
    admission_no: "admissionNo",
    admission_number: "admissionNo",
    gender: "gender",
    date_of_birth: "dateOfBirth",
    dob: "dateOfBirth",
    class_name: "currentClassName",
    class: "currentClassName",
    class_section: "currentClassSection",
    section: "currentClassSection",
    guardian_name: "guardianName",
    guardian_phone: "guardianPhone",
    address: "address",
  };
  return map[s] ?? s;
}

export interface CsvParseSuccess {
  ok: true;
  rows: CsvImportRow[];
}
export interface CsvParseFailure {
  ok: false;
  errors: Array<{ row: number; field: string; message: string }>;
  raw: string[][];
}

export type CsvParseResult = CsvParseSuccess | CsvParseFailure;

/** Parse CSV text → validated rows. Errors include 1-indexed row numbers. */
export function parseStudentsCsv(text: string): CsvParseResult {
  const grid = parseCsvText(text);
  if (grid.length === 0) {
    return { ok: false, errors: [{ row: 0, field: "_", message: "Empty file" }], raw: [] };
  }

  const header = grid[0];
  const fieldNames = header.map(normaliseHeader);
  const required = ["email", "fullName", "admissionNo"];
  for (const r of required) {
    if (!fieldNames.includes(r)) {
      return {
        ok: false,
        errors: [
          { row: 1, field: r, message: `Missing required header: ${r}` },
        ],
        raw: grid,
      };
    }
  }

  const errors: Array<{ row: number; field: string; message: string }> = [];
  const rows: CsvImportRow[] = [];

  for (let r = 1; r < grid.length; r++) {
    const rawRow = grid[r];
    const obj: Record<string, string> = {};
    for (let c = 0; c < fieldNames.length; c++) {
      obj[fieldNames[c]] = (rawRow[c] ?? "").trim();
    }
    const parsed = csvImportRowSchema.safeParse(obj);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push({
          row: r + 1,
          field: issue.path.join(".") || "_",
          message: issue.message,
        });
      }
    } else {
      rows.push(parsed.data);
    }
  }

  if (errors.length > 0) return { ok: false, errors, raw: grid };
  return { ok: true, rows };
}