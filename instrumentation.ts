/**
 * Next.js instrumentation hook — runs once when the server boots.
 * We use it to optionally start the in-process cron scheduler.
 *
 * Enabled only when ENABLE_CRON=true so production deployments can opt in.
 * Disable by default so cold-start serverless deployments don't all race to
 * run cron at midnight. Pair with the `/api/cron/*` endpoints when you want
 * a single dedicated cron worker.
 */
export async function register() {
  if (process.env.ENABLE_CRON !== "true") return;
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { startScheduler } = await import("@/lib/cron");
  startScheduler();
}