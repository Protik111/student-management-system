"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import Input from "@/components/ui/Input";

interface SearchInputProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  /** Debounce in ms. Defaults to 200. */
  delayMs?: number;
  className?: string;
}

/**
 * Debounced search input. Holds an internal string and pushes the value
 * upstream after `delayMs` of inactivity so the parent list doesn't re-fetch
 * on every keystroke.
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  delayMs = 200,
  className,
}: SearchInputProps) {
  const [draft, setDraft] = useState(value);

  // Sync internal state when the upstream value resets (e.g. clear button).
  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (draft === value) return;
    const t = setTimeout(() => onChange(draft), delayMs);
    return () => clearTimeout(t);
  }, [draft, value, delayMs, onChange]);

  return (
    <div className={`relative ${className ?? ""}`}>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle"
      />
      <Input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className="pl-9 w-64"
        aria-label="Search"
      />
    </div>
  );
}