import { requirePermission } from "@/lib/auth-helpers";
import TeachersList from "@/components/admin/teachers/TeachersList";
import {
  getTeacherFormOptions,
  listTeachers,
} from "@/lib/actions/teachers";

export const metadata = { title: "Teachers · School Admin" };

export default async function SchoolAdminTeachersPage() {
  const me = await requirePermission("manage_teachers");
  const [teachers, options] = await Promise.all([
    listTeachers(),
    getTeacherFormOptions(),
  ]);

  return (
    <TeachersList
      variant="school_admin"
      initialTeachers={teachers}
      options={options}
      currentUserId={me.id}
    />
  );
}