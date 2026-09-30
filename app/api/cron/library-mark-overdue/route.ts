import { NextResponse } from "next/server";

import { markOverdueBooks } from "@/lib/cron/library";

/**
 * POST /api/cron/library-mark-overdue
 *
 * Manual trigger for the daily "mark overdue" task. Same logic the in-process
 * scheduler runs at 00:00. Secured by a shared secret in `Authorization` header
 * to prevent unauthorized triggers.
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (expected && auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updated = await markOverdueBooks();
  return NextResponse.json({ ok: true, updated });
}

export async function GET() {
  return NextResponse.json({ ok: false, hint: "POST to trigger" }, { status: 405 });
}