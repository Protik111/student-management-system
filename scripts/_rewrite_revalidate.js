const fs = require('fs');
const files = [
  'lib/actions/schools.ts',
  'lib/actions/students.ts',
  'lib/actions/teachers.ts',
  'lib/actions/users.ts',
  'lib/actions/enrollments.ts',
  'lib/actions/fees.ts',
  'lib/actions/students-import.ts',
  'lib/actions/results.ts',
];
let touched = 0;
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, 'utf8');
  const before = s;
  s = s.replace(/revalidatePath\("\/super-admin\/([^"]*)"\)/g, 'revalidatePath("/admin/$1")');
  s = s.replace(/revalidatePath\("\/school-admin\/([^"]*)"\)/g, 'revalidatePath("/admin/$1")');
  if (s !== before) {
    fs.writeFileSync(f, s);
    touched++;
    console.log('updated', f);
  }
}
console.log('done; touched =', touched);