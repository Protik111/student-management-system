import { Users, GraduationCap, School, BarChart3, UserCog, Wallet, BookMarked, FileBarChart, History } from "lucide-react";

import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import RoleBadge from "@/components/auth/RoleBadge";
import { ROLE_LABEL, ROLE_NAV, type Role, type Permission, can } from "@/lib/rbac";
import { requireUser } from "@/lib/auth-helpers";

interface ModuleCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: Permission;
  href: string;
  /** Module number that delivered this surface. Used for "Module N" tag at the
   *  bottom of each card. Undefined = unshipped (renders "Coming soon"). */
  moduleNumber?: number;
}

const MODULE_CARDS: ModuleCard[] = [
  {
    title: "Schools",
    description: "Provision and manage multi-school installations.",
    icon: School,
    permission: "manage_schools",
    href: "/admin/schools",
    moduleNumber: 2,
  },
  {
    title: "Users",
    description: "Create, edit, and deactivate system users.",
    icon: UserCog,
    permission: "manage_users",
    href: "/admin/users",
    moduleNumber: 2,
  },
  {
    title: "Students",
    description: "Admissions, profiles, and class assignments.",
    icon: GraduationCap,
    permission: "manage_students",
    href: "/admin/students",
    moduleNumber: 3,
  },
  {
    title: "Teachers",
    description: "Faculty records and qualifications.",
    icon: Users,
    permission: "manage_teachers",
    href: "/admin/teachers",
    moduleNumber: 3,
  },
  {
    title: "Enrollments",
    description: "Manage student enrollment status across the academic year.",
    icon: BookMarked,
    permission: "manage_enrollments",
    href: "/admin/enrollments",
    moduleNumber: 4,
  },
  {
    title: "Fees & Payments",
    description: "Issue invoices, record payments, and print receipts.",
    icon: Wallet,
    permission: "manage_fees",
    href: "/admin/fees",
    moduleNumber: 4,
  },
  {
    title: "Reports",
    description: "Generate and publish student report cards.",
    icon: FileBarChart,
    permission: "generate_report_cards",
    href: "/admin/reports",
    moduleNumber: 4,
  },
  {
    title: "Audit Log",
    description: "Every change recorded against your school.",
    icon: History,
    permission: "view_audit",
    href: "/admin/audit",
    moduleNumber: 4,
  },
  {
    title: "Analytics",
    description: "KPIs and dashboards by role.",
    icon: BarChart3,
    permission: "view_dashboard",
    href: "/admin",
  },
];

interface RoleOverviewProps {
  role: Role;
  /** Short headline shown under the page title. */
  tagline: string;
}

export default async function RoleOverview({ role, tagline }: RoleOverviewProps) {
  const user = await requireUser();
  const visible = MODULE_CARDS.filter((m) => can(user.role, m.permission)).filter(
    // Hide cards the user already has access to via sidebar root — keeps the page tidy
    (m) => !ROLE_NAV[user.role].some((n) => n.href === m.href && n.label === "Overview"),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${ROLE_LABEL[role]} dashboard`}
        description={tagline}
        actions={<RoleBadge role={role} />}
      />

      {/* Quick facts */}
      <section
        aria-label="Account"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <Card>
          <p className="text-meta uppercase tracking-[0.06em] text-text-subtle">Full name</p>
          <p className="mt-1 text-card-title font-semibold text-text">{user.fullName}</p>
        </Card>
        <Card>
          <p className="text-meta uppercase tracking-[0.06em] text-text-subtle">Email</p>
          <p className="mt-1 text-card-title font-semibold break-all text-text">{user.email}</p>
        </Card>
        <Card>
          <p className="text-meta uppercase tracking-[0.06em] text-text-subtle">School</p>
          <p className="mt-1 text-card-title font-semibold text-text">
            {user.schoolId ? user.schoolId.slice(0, 8) + "…" : "—"}
          </p>
        </Card>
      </section>

      {/* Module grid */}
      <section aria-label="Modules">
        <h2 className="mb-4 text-subheading font-semibold text-text">Modules available to you</h2>
        {visible.length === 0 ? (
          <p className="rounded-card border border-dashed border-border bg-card p-8 text-center text-default text-text-muted">
            No additional modules are unlocked for your role yet. Module 2 ships next.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((m) => {
              const Icon = m.icon;
              return (
                <Card key={m.title} hoverable className="flex flex-col gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-chip bg-emerald-bg text-emerald">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-card-title font-semibold text-text">{m.title}</h3>
                    <p className="mt-1 text-default text-text-muted">{m.description}</p>
                  </div>
                  <p className="mt-auto text-meta text-text-subtle">
                    {m.moduleNumber
                      ? `Module ${m.moduleNumber} — available`
                      : "Coming soon"}
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}