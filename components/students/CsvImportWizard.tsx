"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Download, FileText, Upload } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useToast } from "@/contexts/ToastContext";
import { importStudentsCsv, type ImportSummary } from "@/lib/actions/students-import";
import { parseStudentsCsv, type CsvParseResult } from "@/lib/csv";

interface CsvImportWizardProps {
  variant: "ADMIN";
  hrefBack: string;
}

/**
 * 3-step wizard:
 *   1. Download template (optional)
 *   2. Drop or paste CSV → preview rows + per-row errors
 *   3. Confirm default password → import → result summary
 */
export default function CsvImportWizard({ variant, hrefBack }: CsvImportWizardProps) {
  const router = useRouter();
  const toast = useToast();
  const [text, setText] = useState("");
  const [parse, setParse] = useState<CsvParseResult | null>(null);
  const [defaultPassword, setDefaultPassword] = useState("changeme123");
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const handleFile = useCallback(async (file: File) => {
    const t = await file.text();
    setText(t);
    setParse(parseStudentsCsv(t));
    setSummary(null);
  }, []);

  const handleText = useCallback((v: string) => {
    setText(v);
    if (v.trim().length === 0) {
      setParse(null);
    } else {
      setParse(parseStudentsCsv(v));
    }
    setSummary(null);
  }, []);

  async function handleImport() {
    if (!parse?.ok) return;
    setImporting(true);
    const res = await importStudentsCsv({
      rows: parse.rows,
      defaultPassword,
      skipExisting: true,
    });
    setImporting(false);
    if (!res.ok) {
      toast.error({ title: "Import failed", description: res.error });
      return;
    }
    setSummary(res.data);
    if (res.data.inserted > 0) {
      toast.success({
        title: `Imported ${res.data.inserted} student${res.data.inserted === 1 ? "" : "s"}`,
        description:
          res.data.failed + res.data.skipped > 0
            ? `${res.data.failed + res.data.skipped} row(s) skipped — see report below.`
            : "All rows imported successfully.",
      });
      router.refresh();
    }
  }

  function downloadTemplate() {
    const header = [
      "email",
      "fullName",
      "admissionNo",
      "gender",
      "dateOfBirth",
      "class",
      "section",
      "guardianName",
      "guardianPhone",
      "address",
    ].join(",");
    const sample = [
      "rahim@school.com,Rahim Ahmed,ADM-2026-100,male,2010-04-15,Grade 10,A,Karim Ahmed,+880 1700 000001,House 1 Dhaka",
      "fatema@school.com,Fatema Khan,ADM-2026-101,female,2010-08-22,Grade 10,B,Rahela Khan,+880 1700 000002,House 2 Dhaka",
    ].join("\n");
    const blob = new Blob([header + "\n" + sample + "\n"], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" href={hrefBack} className="-ml-3">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to students
        </Button>
      </div>

      <div>
        <h1 className="text-page-title font-semibold text-text">Import students</h1>
        <p className="mt-1 text-default text-text-muted">
          Bulk-create student accounts from a CSV file. Each row needs at least
          email, full name, and admission number.
        </p>
      </div>

      {/* Step 1: Template */}
      <Card>
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-chip bg-emerald-bg text-emerald">
            <FileText className="h-5 w-5" aria-hidden />
          </span>
          <div className="flex-1">
            <p className="text-default font-medium text-text">Step 1 · Get a template</p>
            <p className="text-meta text-text-subtle">
              Headers are case-insensitive. Required columns: email, fullName, admissionNo.
              Optional: gender, dateOfBirth (YYYY-MM-DD), class, section, guardianName,
              guardianPhone, address.
            </p>
          </div>
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4" aria-hidden /> Download CSV template
          </Button>
        </div>
      </Card>

      {/* Step 2: Paste / upload */}
      <Card>
        <p className="text-default font-medium text-text">Step 2 · Paste or drop your CSV</p>
        <p className="mt-1 text-meta text-text-subtle">
          We'll preview every row and flag any errors before you commit.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="sr-only">Upload CSV file</span>
            <div className="flex h-32 cursor-pointer items-center justify-center rounded-card border-2 border-dashed border-border bg-base text-center text-default text-text-muted hover:border-emerald">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                }}
                className="sr-only"
              />
              <span>
                <Upload className="mx-auto mb-2 h-6 w-6 text-text-subtle" aria-hidden />
                <br />
                <span className="font-medium text-text">Click to choose a CSV file</span>
              </span>
            </div>
          </label>

          <textarea
            value={text}
            onChange={(e) => handleText(e.target.value)}
            placeholder="…or paste your CSV text here"
            rows={6}
            className="block w-full rounded-card border border-border bg-card p-3 font-mono text-meta text-text placeholder:text-text-subtle focus:border-emerald focus:outline-none"
          />
        </div>

        {parse && !parse.ok && (
          <div className="mt-4 rounded-card border border-danger bg-danger-bg p-3 text-meta text-danger">
            <p className="font-semibold">{parse.errors.length} error(s) found</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              {parse.errors.slice(0, 20).map((e, i) => (
                <li key={i}>
                  Row {e.row}, column <span className="font-mono">{e.field}</span>: {e.message}
                </li>
              ))}
              {parse.errors.length > 20 && (
                <li>…and {parse.errors.length - 20} more</li>
              )}
            </ul>
          </div>
        )}

        {parse?.ok && (
          <div className="mt-4">
            <p className="text-default font-medium text-text">
              {parse.rows.length} row(s) ready to import
            </p>
            <div className="mt-3 max-h-72 overflow-y-auto rounded-card border border-border">
              <table className="w-full text-default">
                <thead>
                  <tr className="border-b border-border text-meta uppercase tracking-[0.06em] text-text-subtle">
                    <th className="px-3 py-2 text-left font-semibold">Email</th>
                    <th className="px-3 py-2 text-left font-semibold">Full Name</th>
                    <th className="px-3 py-2 text-left font-semibold">Admission #</th>
                    <th className="px-3 py-2 text-left font-semibold">Class</th>
                  </tr>
                </thead>
                <tbody>
                  {parse.rows.slice(0, 50).map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-b-0">
                      <td className="px-3 py-2 font-mono text-meta text-text-muted">
                        {r.email}
                      </td>
                      <td className="px-3 py-2 text-text">{r.fullName}</td>
                      <td className="px-3 py-2 font-mono text-meta text-text-muted">
                        {r.admissionNo}
                      </td>
                      <td className="px-3 py-2 text-text-muted">
                        {r.currentClassName
                          ? `${r.currentClassName}-${r.currentClassSection || "A"}`
                          : <span className="text-text-subtle">no class</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parse.rows.length > 50 && (
                <p className="border-t border-border bg-base px-3 py-2 text-meta text-text-subtle">
                  Showing first 50 of {parse.rows.length} rows.
                </p>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Step 3: Confirm */}
      <Card>
        <p className="text-default font-medium text-text">Step 3 · Confirm import</p>
        <p className="mt-1 text-meta text-text-subtle">
          Every new student account will use this temporary password; share it
          securely out-of-band. They'll be asked to change it on first login.
        </p>

        <div className="mt-4 max-w-sm">
          <Input
            label="Default password"
            type="text"
            value={defaultPassword}
            onChange={(e) => setDefaultPassword(e.target.value)}
            hint="Must be at least 8 characters."
            error={
              defaultPassword.length < 8 ? "Password must be at least 8 characters" : undefined
            }
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button
            onClick={handleImport}
            loading={importing}
            disabled={!parse?.ok || defaultPassword.length < 8}
          >
            <ArrowRight className="h-4 w-4" aria-hidden /> Import {parse?.ok ? parse.rows.length : 0} student{parse?.ok && parse.rows.length === 1 ? "" : "s"}
          </Button>
          {summary && (
            <Button variant="outline" href={hrefBack}>
              Back to list
            </Button>
          )}
        </div>

        {summary && (
          <div
            className={`mt-4 rounded-card border p-3 text-default ${
              summary.failed > 0
                ? "border-warning bg-warning-bg text-warning"
                : "border-emerald bg-emerald-bg text-emerald"
            }`}
          >
            <p>
              Imported <strong>{summary.inserted}</strong>, skipped{" "}
              <strong>{summary.skipped}</strong>, failed <strong>{summary.failed}</strong>.
            </p>
            {summary.errors.length > 0 && (
              <details className="mt-2 text-meta">
                <summary className="cursor-pointer font-medium">
                  View {summary.errors.length} issue(s)
                </summary>
                <ul className="mt-2 list-disc space-y-0.5 pl-5">
                  {summary.errors.slice(0, 50).map((e, i) => (
                    <li key={i}>
                      Row {e.row}
                      {e.email ? ` (${e.email})` : ""}: {e.reason}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}