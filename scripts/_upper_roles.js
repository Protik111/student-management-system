/**
 * Round 2 — uppercase the remaining lower-case role literals ("teacher",
 * "student") only inside role contexts (primaryRole / role: / roles / Role
 * arrays etc.). This is intentionally narrow to avoid touching unrelated
 * "teacher"/"student" strings (e.g. component labels in UI text).
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

  // primaryRole: "teacher" / primaryRole: 'teacher' → TEACHER
  s = s.replace(/(primaryRole\s*:\s*)["']teacher["']/g, '$1"TEACHER"');
  s = s.replace(/(primaryRole\s*:\s*)["']student["']/g, '$1"STUDENT"');
  // role: "teacher" / role: 'teacher' inside UserRole / source / etc.
  s = s.replace(/(role\s*:\s*)["']teacher["']/g, '$1"TEACHER"');
  s = s.replace(/(role\s*:\s*)["']student["']/g, '$1"STUDENT"');
  // standalone string literals in role contexts
  s = s.replace(/\bz\s*:\s*enum\(\["']teacher["']\)/g, 'z: enum(["TEACHER"])');
  s = s.replace(/\bz\s*:\s*enum\(\["']student["']\)/g, 'z: enum(["STUDENT"])');
  // assignable roles arrays etc.
  s = s.replace(/\["teacher"\]/g, '["TEACHER"]');
  s = s.replace(/\["student"\]/g, '["STUDENT"]');
  s = s.replace(/\["teacher",\s*"student"\]/g, '["TEACHER", "STUDENT"]');
  s = s.replace(/\["student",\s*"teacher"\]/g, '["STUDENT", "TEACHER"]');

  if (s !== before) {
    fs.writeFileSync(f, s);
    totalChanged++;
    console.log('updated', f);
  }
}
console.log('files updated =', totalChanged);