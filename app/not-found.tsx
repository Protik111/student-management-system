import Link from "next/link";
import { Compass } from "lucide-react";

import Button from "@/components/ui/Button";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <div className="w-full max-w-md rounded-card border border-border bg-card p-10 text-center shadow-card">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-chip bg-warning-bg text-warning">
          <Compass className="h-7 w-7" />
        </div>
        <p className="text-meta uppercase tracking-[0.08em] text-text-subtle">Error 404</p>
        <h1 className="mt-2 text-page-title font-semibold tracking-tight text-text">
          We can&apos;t find that page
        </h1>
        <p className="mt-3 text-default text-text-muted">
          The link may be broken, or the page may have been moved. Try signing in again.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button href="/login" variant="primary">
            Back to sign in
          </Button>
          <Button href="/" variant="outline">
            Home
          </Button>
        </div>
        <Link
          href="/"
          className="mt-6 inline-block text-meta text-text-subtle hover:text-emerald"
        >
          sms.local
        </Link>
      </div>
    </div>
  );
}