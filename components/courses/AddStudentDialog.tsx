"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

import AppSelect from "@/components/ui/AppSelect";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";
import { addStudentToCourse } from "@/lib/actions/course-enrollments";

interface StudentOption {
  id: string;
  fullName: string;
  email: string;
}

interface AddStudentDialogProps {
  courseId: string;
  students: StudentOption[];
}

export default function AddStudentDialog({
  courseId,
  students,
}: AddStudentDialogProps) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [pending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);

  const options = students.map((s) => ({
    value: s.id,
    label: `${s.fullName} — ${s.email}`,
  }));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!studentId) {
      toast.error({ title: "Pick a student" });
      return;
    }
    setSubmitting(true);
    const r = await addStudentToCourse({ courseId, studentId });
    setSubmitting(false);
    if (!r.ok) {
      toast.error({ title: "Couldn't add student", description: r.error });
      return;
    }
    toast.success({ title: "Student added" });
    setStudentId("");
    setOpen(false);
    startTransition(() => router.refresh());
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={students.length === 0}>
        <UserPlus className="h-4 w-4" aria-hidden /> Add student
      </Button>
      <Modal
        open={open}
        onClose={() => (submitting ? undefined : setOpen(false))}
        title="Add a student to this course"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <AppSelect
            label="Student"
            required
            options={options}
            value={studentId}
            onValueChange={setStudentId}
            placeholder={
              students.length === 0
                ? "No eligible students in your school"
                : "Pick a student…"
            }
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting || pending}>
              Add to course
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}