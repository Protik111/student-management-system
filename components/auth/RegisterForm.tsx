"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useToast } from "@/contexts/ToastContext";
import { signIn } from "next-auth/react";
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/actions/schemas";
import { registerStudent } from "@/lib/actions/register";

export default function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterInput) {
    setSubmitting(true);
    const result = await registerStudent(values);
    if (!result.ok) {
      setSubmitting(false);
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (!messages?.length) continue;
          setError(field as keyof RegisterInput, {
            type: "server",
            message: messages[0],
          });
        }
      }
      toast.error({
        title: "Couldn't create account",
        description: result.error,
      });
      return;
    }
    // Auto-sign-in after registration so the user lands on their dashboard.
    const signin = await signIn("credentials", {
      email: values.email.toLowerCase().trim(),
      password: values.password,
      redirect: false,
    });
    setSubmitting(false);
    if (!signin || signin.error) {
      toast.success({
        title: "Account created",
        description: "Sign in with your new credentials to continue.",
      });
      router.replace("/login?registered=1");
      return;
    }
    toast.success({ title: "Welcome!" });
    router.replace("/student");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input
        label="Full name"
        placeholder="e.g. Karim Rahman"
        required
        autoComplete="name"
        autoFocus
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        required
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="At least 8 characters"
          required
          autoComplete="new-password"
          hint="At least 8 characters."
          error={errors.password?.message}
          {...register("password")}
        />
        <button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-[2.4rem] text-text-muted hover:text-text"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" aria-hidden />
          ) : (
            <Eye className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
      <Input
        label="Confirm password"
        type={showPassword ? "text" : "password"}
        placeholder="Repeat your password"
        required
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button type="submit" loading={submitting} className="w-full">
        Create account
      </Button>

      <p className="text-meta text-text-subtle">
        By signing up you agree to be enrolled as a public student. An
        administrator will attach you to your school after your first sign-in.
        {" "}
        <Link href="/login" className="font-medium text-emerald hover:underline">
          Already registered?
        </Link>
      </p>
    </form>
  );
}