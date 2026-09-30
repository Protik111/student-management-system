import { requirePermission } from "@/lib/auth-helpers";
import UsersList from "@/components/admin/users/UsersList";
import {
  getUserFormOptions,
  listUsers,
} from "@/lib/actions/users";

export const metadata = { title: "Users · School Admin" };

export default async function SchoolAdminUsersPage() {
  const me = await requirePermission("manage_users");
  const [users, options] = await Promise.all([
    listUsers(),
    getUserFormOptions(),
  ]);

  return (
    <UsersList
      variant="school_admin"
      initialUsers={users}
      options={options}
      currentUserId={me.id}
    />
  );
}