import { NextResponse } from "next/server";

import { finalizeAttendanceForDate } from "@/lib/cron/attendance";

/**
 * POST /api/cron/attendance-finalize
 *
 * Manual trigger for the daily "finalize attendance" task. Same logic the
 * in-process scheduler runs at 23:00. Secured by a shared secret in
 * `Authorization` header to prevent unauthorized triggers.
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (expected && auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const created = await finalizeAttendanceForDate();
  return NextResponse.json({ ok: true, created });
}

export async function GET() {
  return NextResponse.json({ ok: false, hint: "POST to trigger" }, { status: 405 });
}