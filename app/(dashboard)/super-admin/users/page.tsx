import { requirePermission } from "@/lib/auth-helpers";
import UsersList from "@/components/admin/users/UsersList";
import {
  getUserFormOptions,
  listUsers,
} from "@/lib/actions/users";

export const metadata = { title: "Users · Super Admin" };

export default async function SuperAdminUsersPage() {
  const me = await requirePermission("manage_users");
  const [users, options] = await Promise.all([
    listUsers(),
    getUserFormOptions(),
  ]);

  return (
    <UsersList
      variant="super_admin"
      initialUsers={users}
      options={options}
      currentUserId={me.id}
    />
  );
}