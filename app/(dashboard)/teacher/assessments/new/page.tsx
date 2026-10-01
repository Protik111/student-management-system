import { requirePermission } from "@/lib/auth-helpers";
import { prisma } from "@/lib/db/prisma";
import AssessmentForm from "@/components/assessments/AssessmentForm";
import PageHeader from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function NewAssessmentPage() {
  const actor = await requirePermission("manage_assessments");

  const where: Record<string, unknown> = {};
  if (actor.schoolId) where.schoolId = actor.schoolId;

  const [classes, subjects] = await Promise.all([
    prisma.class.findMany({
      where,
      orderBy: [{ name: "asc" }, { section: "asc" }],
      select: { id: true, name: true, section: true },
    }),
    prisma.subject.findMany({
      where,
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New assessment"
        description="Define the work, deadline, and grading rules. Students in the selected class will be notified."
      />
      <div className="rounded-card border border-border bg-card p-6">
        <AssessmentForm
          classes={classes.map((c) => ({
            id: c.id,
            label: `${c.name}${c.section ? ` – ${c.section}` : ""}`,
          }))}
          subjects={subjects.map((s) => ({ id: s.id, label: s.name }))}
        />
      </div>
    </div>
  );
}