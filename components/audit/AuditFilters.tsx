"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

import AppSelect from "@/components/ui/AppSelect";
import Input from "@/components/ui/Input";

interface AuditFiltersProps {
  entityTypes: string[];
}

/**
 * Server-state-driven filters. Updates the URL query string and lets the
 * server component re-fetch the filtered rows.
 */
export default function AuditFilters({ entityTypes }: AuditFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const entityType = params.get("entityType") ?? "";
  const actorId = params.get("actorId") ?? "";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";

  const entityTypeOptions = [
    { value: "", label: "All entity types" },
    ...entityTypes.map((t) => ({ value: t, label: t })),
  ];

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      startTransition(() => router.replace(`?${next.toString()}`));
    },
    [params, router],
  );

  return (
    <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${pending ? "opacity-70" : ""}`}>
      <AppSelect
        label="Entity type"
        options={entityTypeOptions}
        value={entityType}
        onValueChange={(v) => update("entityType", v)}
        placeholder="All entity types"
      />
      <Input
        label="Actor user id"
        placeholder="Filter by actor id…"
        defaultValue={actorId}
        onBlur={(e) => update("actorId", e.target.value.trim())}
      />
      <Input
        label="From"
        type="date"
        defaultValue={from}
        onBlur={(e) => update("from", e.target.value)}
      />
      <Input
        label="To"
        type="date"
        defaultValue={to}
        onBlur={(e) => update("to", e.target.value)}
      />
    </div>
  );
}