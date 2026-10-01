"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import AppSelect from "@/components/ui/AppSelect";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import DatePicker from "@/components/ui/DatePicker";
import { useToast } from "@/contexts/ToastContext";
import {
  assessmentCreateSchema,
  type AssessmentCreateInput,
} from "@/lib/actions/schemas";
import { createAssessment } from "@/lib/actions/assessments";

interface AssessmentFormProps {
  classes: { id: string; label: string }[];
  subjects: { id: string; label: string }[];
}

function asOptions<T extends { id: string; label: string }>(arr: T[]) {
  return arr.map((o) => ({ value: o.id, label: o.label }));
}

export default function AssessmentForm({
  classes,
  subjects,
}: AssessmentFormProps) {
  const router = useRouter();
  const toast = useToast();
  const {
    register,
    control: ctrl,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AssessmentCreateInput>({
    resolver: zodResolver(assessmentCreateSchema) as never,
    defaultValues: {
      classId: "",
      subjectId: "",
      title: "",
      module: "",
      description: "",
      deadline: format(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        "yyyy-MM-dd",
      ),
      allowResub: true,
      lateAccepted: true,
      maxMarks: 100,
    },
  });

  async function onSubmit(values: AssessmentCreateInput) {
    const res = await createAssessment(values as never);
    if (!res.ok) {
      toast.error({
        title: "Couldn't create assessment",
        description: res.error,
      });
      return;
    }
    toast.success({ title: "Assessment created" });
    router.push(`/teacher/assessments/${res.data.id}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Controller
        control={ctrl}
        name="classId"
        render={({ field }) => (
          <AppSelect
            label="Class"
            required
            options={asOptions(classes)}
            value={field.value ?? ""}
            onValueChange={(v) => field.onChange(v)}
            placeholder={
              classes.length === 0 ? "No classes in your school" : "Pick one…"
            }
            error={errors.classId?.message}
          />
        )}
      />

      <Controller
        control={ctrl}
        name="subjectId"
        render={({ field }) => (
          <AppSelect
            label="Subject"
            required
            options={asOptions(subjects)}
            value={field.value ?? ""}
            onValueChange={(v) => field.onChange(v)}
            placeholder={
              subjects.length === 0 ? "No subjects available" : "Pick one…"
            }
            error={errors.subjectId?.message}
          />
        )}
      />

      <Input
        label="Title"
        placeholder="e.g. Term 1 Project Submission"
        required
        error={errors.title?.message}
        {...register("title")}
      />

      <Input
        label="Module"
        placeholder="e.g. Module 4: Kinematics"
        required
        error={errors.module?.message}
        {...register("module")}
      />

      <Input
        label="Description (optional)"
        placeholder="What students need to do…"
        {...register("description")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={ctrl}
          name="deadline"
          render={({ field }) => (
            <DatePicker
              label="Deadline"
              value={
                field.value instanceof Date
                  ? field.value.toISOString().slice(0, 10)
                  : typeof field.value === "string"
                    ? field.value
                    : ""
              }
              onChange={(v) => field.onChange(v)}
              error={errors.deadline?.message}
            />
          )}
        />
        <Input
          label="Max marks"
          type="number"
          min={1}
          max={1000}
          required
          error={errors.maxMarks?.message}
          {...register("maxMarks", { valueAsNumber: true })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-start gap-2 text-default text-text">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-emerald"
            {...register("allowResub")}
          />
          <span>
            <span className="block font-medium">Allow resubmissions</span>
            <span className="block text-meta text-text-subtle">
              Students can replace their submission until graded.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-2 text-default text-text">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-emerald"
            {...register("lateAccepted")}
          />
          <span>
            <span className="block font-medium">Accept late submissions</span>
            <span className="block text-meta text-text-subtle">
              Submissions past the deadline will still be accepted (flagged late).
            </span>
          </span>
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          href="/teacher/assessments"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Create assessment
        </Button>
      </div>
    </form>
  );
}