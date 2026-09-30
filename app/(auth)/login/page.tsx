import Link from "next/link";
import { redirect } from "next/navigation";

import LoginForm from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { dashboardPathFor } from "@/lib/rbac";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(dashboardPathFor(user.role));
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-page-title font-semibold tracking-tight text-text">
          Welcome back
        </h2>
        <p className="text-default text-text-muted">
          Sign in to access your dashboard.
        </p>
      </header>

      <LoginForm />

      <p className="text-center text-meta text-text-subtle">
        Trouble signing in?{" "}
        <Link href="mailto:admin@sms.local" className="font-medium text-emerald hover:underline">
          Contact your administrator
        </Link>
        .
      </p>
    </div>
  );
}