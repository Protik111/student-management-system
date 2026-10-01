import { requirePermission } from "@/lib/auth-helpers";
import StudentsList from "@/components/admin/students/StudentsList";
import {
  getStudentFormOptions,
  listStudents,
} from "@/lib/actions/students";

export const metadata = { title: "Students · School Admin" };

export default async function SchoolAdminStudentsPage() {
  const me = await requirePermission("manage_students");
  const [students, options] = await Promise.all([
    listStudents(),
    getStudentFormOptions(),
  ]);

  return (
    <StudentsList
      variant="ADMIN"
      initialStudents={students}
      options={options}
      currentUserId={me.id}
    />
  );
}