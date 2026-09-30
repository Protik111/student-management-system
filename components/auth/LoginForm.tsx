"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { LogIn, Eye, EyeOff } from "lucide-react";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/contexts/ToastContext";
import { cn } from "@/lib/utils";
import { dashboardPathFor } from "@/lib/rbac";
import type { Role } from "@/lib/db/schema";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

/** Maps NextAuth `?error=` codes to friendly messages. */
const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  Configuration: "Auth is misconfigured. Contact your administrator.",
  AccessDenied: "Your account does not have access to this role.",
  Verification: "Verification link is invalid or has expired.",
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { error: toastError, success } = useToast();

  const callbackUrl = searchParams.get("callbackUrl");
  const urlError = searchParams.get("error");
  const sessionExpired = searchParams.get("expired") === "1";

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(
    urlError ? ERROR_MESSAGES[urlError] ?? "Sign-in failed." : null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    const result = await signIn("credentials", {
      email: values.email.trim().toLowerCase(),
      password: values.password,
      redirect: false,
    });

    if (!result || result.error) {
      const code = result?.error ?? "CredentialsSignin";
      const msg = ERROR_MESSAGES[code] ?? "Sign-in failed.";
      setServerError(msg);
      toastError({ title: "Sign-in failed", description: msg });
      return;
    }

    success({ title: "Welcome back", description: "Loading your dashboard…" });

    // Determine redirect target: callbackUrl (if local + safe) else role home.
    // We do a hard navigation so the middleware-issued JWT is read fresh.
    let target = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : null;
    if (!target) {
      // Probe the session once to discover role
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const session = await res.json();
      const role = session?.user?.role as Role | undefined;
      target = role ? dashboardPathFor(role) : "/";
    }

    router.push(target ?? "/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {sessionExpired && (
        <div
          role="alert"
          className="rounded-chip border border-warning/30 bg-warning-bg px-3.5 py-2.5 text-default text-warning"
        >
          Your session has expired. Please sign in again.
        </div>
      )}

      {serverError && (
        <div
          role="alert"
          className="rounded-chip border border-danger/30 bg-danger-bg px-3.5 py-2.5 text-default text-danger"
        >
          {serverError}
        </div>
      )}

      <Input
        id="email"
        type="email"
        label="Email"
        autoComplete="email"
        placeholder="you@school.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-meta font-semibold uppercase tracking-[0.06em] text-text-muted"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className={cn(
              "w-full rounded-chip border bg-card px-3.5 py-2.5 pr-11 text-default text-text placeholder:text-text-subtle focus:outline-none transition-colors",
              errors.password
                ? "border-danger focus:border-danger"
                : "border-border focus:border-emerald",
            )}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-text-subtle hover:bg-base hover:text-text"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password?.message && (
          <p className="text-meta text-danger">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        <LogIn className="h-4 w-4" />
        Sign in
      </Button>
    </form>
  );
}