"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import Button from "@/components/ui/Button";
import { useToast } from "@/contexts/ToastContext";
import { updateEnrollmentStatus } from "@/lib/actions/enrollments";
import type { EnrollmentStatus } from "@/lib/actions/enrollments";

interface EnrollmentStatusControlProps {
  enrollmentId: string;
  currentStatus: EnrollmentStatus;
  onChanged?: () => void;
}

const OPTIONS: { value: EnrollmentStatus; label: string }[] = [
  { value: "active", label: "Mark Active" },
  { value: "graduated", label: "Mark Graduated" },
  { value: "transferred", label: "Mark Transferred" },
  { value: "dropped", label: "Mark Dropped" },
];

/**
 * Inline dropdown that lets an admin flip an enrollment between active →
 * graduated/transferred/dropped and back. Lives in the table row so it works
 * on the school-wide enrollments page and on the per-student enrollments tab.
 */
export default function EnrollmentStatusControl({
  enrollmentId,
  currentStatus,
  onChanged,
}: EnrollmentStatusControlProps) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  async function changeTo(status: EnrollmentStatus) {
    setBusy(true);
    setOpen(false);
    const res = await updateEnrollmentStatus({ id: enrollmentId, status });
    setBusy(false);
    if (!res.ok) {
      toast.error({
        title: "Couldn't update status",
        description: res.error,
      });
      return;
    }
    toast.success({ title: `Status changed to ${status}` });
    onChanged?.();
  }

  return (
    <div className="relative inline-block">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        loading={busy}
      >
        Change status
        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
      </Button>

      {open && (
        <ul
          role="menu"
          className="absolute right-0 z-20 mt-1 w-44 rounded-card border border-border bg-card py-1 shadow-2xl"
        >
          {OPTIONS.filter((o) => o.value !== currentStatus).map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="menuitem"
                onClick={() => changeTo(o.value)}
                className="block w-full px-3 py-2 text-left text-default text-text hover:bg-base"
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}