"use client";

import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { ENROLLMENT_STATUSES, type EnrollmentStatus } from "@/lib/db/types";
import type { EnrollmentListItem } from "@/lib/actions/students";
import type { StudentListItem } from "@/lib/actions/students";
import StudentNameCell from "@/components/admin/shared/StudentNameCell";

interface EnrollmentsListProps {
  variant: "super_admin" | "school_admin";
  student: StudentListItem;
  enrollments: EnrollmentListItem[];
}

const STATUS_LABEL: Record<EnrollmentStatus, string> = {
  active: "Active",
  graduated: "Graduated",
  transferred: "Transferred",
  dropped: "Dropped",
};

const STATUS_TONE: Record<
  EnrollmentStatus,
  "success" | "info" | "warning" | "neutral"
> = {
  active: "success",
  graduated: "info",
  transferred: "warning",
  dropped: "neutral",
};

export default function EnrollmentsList({
  variant,
  student,
  enrollments,
}: EnrollmentsListProps) {
  const hrefBase: "/super-admin" | "/school-admin" =
    variant === "super_admin" ? "/super-admin" : "/school-admin";

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          href={`${hrefBase}/students`}
          className="-ml-3"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to students
        </Button>
      </div>

      <PageHeader
        title="Enrollment history"
        description={`Every class this student has been placed in. Current placement is highlighted.`}
      />

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <StudentNameCell
            admissionNo={student.admissionNo}
            fullName={student.fullName}
            gender={student.gender}
            email={student.email}
            hrefBase={hrefBase}
          />
          <div className="ml-auto text-meta text-text-subtle">
            {student.currentClassName ? (
              <>
                Currently in{" "}
                <span className="font-medium text-text">
                  {student.currentClassName}
                </span>
              </>
            ) : (
              <span className="text-meta">No current class</span>
            )}
          </div>
        </div>
      </Card>

      {enrollments.length === 0 ? (
        <EmptyState
          title="No enrollments yet"
          description="This student hasn't been enrolled in any class."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-default">
            <thead>
              <tr className="border-b border-border text-meta uppercase tracking-[0.06em] text-text-subtle">
                <th className="px-4 py-3 text-left font-semibold">Class</th>
                <th className="px-4 py-3 text-left font-semibold">Academic year</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Enrolled on</th>
                <th className="px-4 py-3 text-left font-semibold">Left on</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => {
                const isCurrent =
                  e.status === "active" &&
                  student.currentClassId === e.classId;
                return (
                  <tr
                    key={e.id}
                    className={`border-b border-border last:border-b-0 hover:bg-base transition-colors ${
                      isCurrent ? "bg-emerald-bg/40" : ""
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-text">
                        {e.className}-{e.classSection}
                        {isCurrent && (
                          <span className="ml-2 text-meta font-normal text-emerald">
                            (current)
                          </span>
                        )}
                      </div>
                      <div className="text-meta text-text-subtle">
                        Grade {e.classGradeLevel}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-meta text-text-muted">
                      {e.academicYear}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={STATUS_TONE[e.status]}>
                        {STATUS_LABEL[e.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-text-muted">
                      {format(e.enrolledAt, "PPP")}
                    </td>
                    <td className="px-4 py-3.5 text-text-muted">
                      {e.leftAt ? format(e.leftAt, "PPP") : (
                        <span className="text-meta text-text-subtle">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <p className="text-meta text-text-subtle">
        Past enrollments are read-only in this module. Editing enrollment status
        (graduated / transferred / dropped) ships with the Class roster module.
      </p>
    </div>
  );
}