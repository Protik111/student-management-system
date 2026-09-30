import { requirePermission } from "@/lib/auth-helpers";
import StudentsList from "@/components/admin/students/StudentsList";
import {
  getStudentFormOptions,
  listStudents,
} from "@/lib/actions/students";

export const metadata = { title: "Students · Super Admin" };

export default async function SuperAdminStudentsPage() {
  const me = await requirePermission("manage_students");
  const [students, options] = await Promise.all([
    listStudents(),
    getStudentFormOptions(),
  ]);

  return (
    <StudentsList
      variant="super_admin"
      initialStudents={students}
      options={options}
      currentUserId={me.id}
    />
  );
}