import Link from "next/link";

import Button from "@/components/ui/Button";
import { ShieldAlert } from "lucide-react";

export const metadata = { title: "Access denied" };

type SearchParams = Promise<{ required?: string; actual?: string }>;

export default async function UnauthorizedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const required = sp.required ?? "a higher-privileged role";
  const actual = sp.actual ?? "your current role";

  return (
    <div className="space-y-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-chip bg-danger-bg text-danger">
        <ShieldAlert className="h-6 w-6" />
      </div>

      <div className="space-y-3">
        <h2 className="text-page-title font-semibold tracking-tight text-text">
          Access denied
        </h2>
        <p className="text-default text-text-muted">
          You tried to open a page that requires the{" "}
          <code className="rounded bg-base px-1.5 py-0.5 text-text">{required}</code> role,
          but you are signed in as{" "}
          <code className="rounded bg-base px-1.5 py-0.5 text-text">{actual}</code>.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button href="/login" variant="primary">
          Back to sign in
        </Button>
        <Button href="/" variant="outline">
          Go home
        </Button>
      </div>

      <p className="text-meta text-text-subtle">
        Need different access?{" "}
        <Link href="mailto:admin@sms.local" className="font-medium text-emerald hover:underline">
          Email your administrator
        </Link>
        .
      </p>
    </div>
  );
}