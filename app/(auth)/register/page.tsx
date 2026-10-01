import Link from "next/link";
import { redirect } from "next/navigation";

import RegisterForm from "@/components/auth/RegisterForm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { dashboardPathFor } from "@/lib/rbac";

export const metadata = {
  title: "Create an account",
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(dashboardPathFor(user.role));
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-page-title font-semibold tracking-tight text-text">
          Create your student account
        </h2>
        <p className="text-default text-text-muted">
          Sign up to browse the course marketplace and enroll in courses at your school.
        </p>
      </header>

      <RegisterForm />

      <p className="text-center text-meta text-text-subtle">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald hover:underline">
          Sign in
        </Link>
        .
      </p>
    </div>
  );
}