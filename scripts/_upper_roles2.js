/**
 * Round 3 — narrow pattern replace for remaining actor.role comparisons and
 * variants that the previous round missed.
 */
const fs = require('fs');
const path = require('path');

const SKIP_DIRS = new Set([
  'node_modules', '.next', '.git', 'public', 'uploads',
  'prisma/migrations',
]);
const SKIP_FILES = new Set([]);

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

  // actor.role === "teacher" / !== "teacher" / === 'teacher'
  s = s.replace(/(actor\.role\s*[!=]==?\s*)["']teacher["']/g, '$1"TEACHER"');
  s = s.replace(/(actor\.role\s*[!=]==?\s*)["']student["']/g, '$1"STUDENT"');
  // user.role === "teacher" / student (used in results.ts)
  s = s.replace(/(user\.role\s*[!=]==?\s*)["']teacher["']/g, '$1"TEACHER"');
  s = s.replace(/(user\.role\s*[!=]==?\s*)["']student["']/g, '$1"STUDENT"');
  // variant === "teacher" / "student" inside AssessmentList (assessment variant, not role)
  // — leave those as-is. They are not Role values, they're UI discriminator.
  // requireRole("student" | "teacher")
  s = s.replace(/(requireRole\(\s*)["']teacher["']/g, '$1"TEACHER"');
  s = s.replace(/(requireRole\(\s*)["']student["']/g, '$1"STUDENT"');
  // role === "student" (results page actor in lists)
  s = s.replace(/(\brole\s*[!=]==?\s*)["']student["']/g, '$1"STUDENT"');
  // primaryRole: z.literal("student") / z.literal("teacher")
  s = s.replace(/(z\.literal\(\s*)["']student["']/g, '$1"STUDENT"');
  s = s.replace(/(z\.literal\(\s*)["']teacher["']/g, '$1"TEACHER"');
  // primaryRole ?? "teacher"
  s = s.replace(/(\?\?\s*)["']teacher["']/g, '$1"TEACHER"');
  s = s.replace(/(\?\?\s*)["']student["']/g, '$1"STUDENT"');

  if (s !== before) {
    fs.writeFileSync(f, s);
    totalChanged++;
    console.log('updated', f);
  }
}
console.log('files updated =', totalChanged);