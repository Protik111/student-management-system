import cron from "node-cron";

import { markOverdueBooks } from "./library";
import { finalizeAttendanceForDate } from "./attendance";

/**
 * In-process cron scheduler. Started by `instrumentation.ts` when
 * ENABLE_CRON=true. Tasks are also exposed as HTTP endpoints under
 * `/api/cron/*` so they can be triggered externally (e.g. Docker
 * `cron` service, k8s CronJob, manual curl in dev).
 *
 * Schedules:
 *   - 00:00 every day   → markOverdueBooks()
 *   - 23:00 every day   → finalizeAttendanceForDate()
 */

declare global {
  // eslint-disable-next-line no-var
  var __smsCronStarted: boolean | undefined;
}

let started = false;

export function startScheduler(logger: (msg: string) => void = console.log): void {
  if (started) return;
  started = true;
  if (globalThis.__smsCronStarted) return;
  if (process.env.NODE_ENV !== "production") {
    globalThis.__smsCronStarted = true;
  }

  cron.schedule("0 0 * * *", async () => {
    try {
      const n = await markOverdueBooks();
      logger(`[cron] library:mark-overdue → ${n} issues updated`);
    } catch (err) {
      logger(`[cron] library:mark-overdue FAILED: ${(err as Error).message}`);
    }
  });

  cron.schedule("0 23 * * *", async () => {
    try {
      const n = await finalizeAttendanceForDate();
      logger(`[cron] attendance:finalize → ${n} classes prepared`);
    } catch (err) {
      logger(`[cron] attendance:finalize FAILED: ${(err as Error).message}`);
    }
  });

  logger("[cron] scheduler started (library:00:00, attendance:23:00)");
}