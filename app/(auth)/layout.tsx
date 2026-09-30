import type { ReactNode } from "react";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* ── Left brand panel (hidden on mobile) ─────────────────────── */}
      <aside className="relative hidden overflow-hidden bg-navy text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-emerald/40 opacity-90"
        />
        <div
          aria-hidden
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-teal/20 blur-3xl"
        />

        <div className="relative flex items-center gap-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-chip bg-emerald">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-card-title font-semibold tracking-tight">SMS</span>
        </div>

        <div className="relative space-y-5">
          <h1 className="text-page-title font-semibold leading-tight tracking-tight">
            School Management
            <br />
            <span className="text-emerald-light">made simple.</span>
          </h1>
          <p className="max-w-md text-default leading-relaxed text-white/70">
            One platform for schools, students, teachers, and library operations. Sign in
            with your school-issued credentials to continue.
          </p>
        </div>

        <p className="relative text-meta text-white/50">
          © {new Date().getFullYear()} School Management System
        </p>
      </aside>

      {/* ── Right form panel ─────────────────────────────────────────── */}
      <main className="flex items-center justify-center bg-base p-6 sm:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}