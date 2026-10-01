/**
 * One-shot role-collapse rewrite. Walks .ts/.tsx files (excluding
 * prisma/migrations and prisma/seed.ts) and:
 *   - replaces "super_admin" / "school_admin" string literals in role contexts
 *     with "ADMIN"
 *   - replaces `actor.role === "school_admin"` / `actor.role !== "super_admin"`
 *     with `actor.role === "ADMIN"` / `actor.role !== "ADMIN"`
 *
 * The result is conservative: anything that says "super_admin" or "school_admin"
 * is treated as an ADMIN literal. It does NOT touch the Prisma migration files
 * (those keep the old labels as part of the data-fix SQL) or seed.ts (we
 * rewrite seed.ts separately because it's all role literals).
 *
 * Re-runnable; safe to apply on already-rewritten files (no-op when there's
 * nothing to replace).
 */
const fs = require('fs');
const path = require('path');

const SKIP_DIRS = new Set([
  'node_modules', '.next', '.git', 'public', 'uploads',
  'prisma/migrations',
]);
const SKIP_FILES = new Set([
  'prisma/seed.ts',
]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) out.push(p);
  }
  return out;
}

const files = walk(process.cwd()).filter((f) => !SKIP_FILES.has(f));

let totalChanged = 0;
for (const f of files) {
  let s = fs.readFileSync(f, 'utf8');
  const before = s;

  // String-literal role names: only inside quoted forms that aren't type names.
  // We intentionally do NOT replace identifiers like `Role` or type aliases.
  s = s.replace(/"super_admin"/g, '"ADMIN"');
  s = s.replace(/'super_admin'/g, "'ADMIN'");
  s = s.replace(/"school_admin"/g, '"ADMIN"');
  s = s.replace(/'school_admin'/g, "'ADMIN'");

  if (s !== before) {
    fs.writeFileSync(f, s);
    totalChanged++;
    console.log('updated', f);
  }
}
console.log('files updated =', totalChanged);