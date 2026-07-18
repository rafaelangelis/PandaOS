import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { UsersTable } from "./UsersTable";
import { GroupsTable } from "./GroupsTable";

export default async function UsuariosPage() {
  await requirePermission("usuarios", "view");

  const [users, groups] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: "asc" }, include: { permissionGroup: true } }),
    prisma.permissionGroup.findMany({ orderBy: { name: "asc" }, include: { users: true } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 font-sans">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Usuários</h1>
        <Link
          href="/usuarios/novo"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          + Novo usuário
        </Link>
      </div>

      <div className="mb-10">
        <UsersTable
          users={users.map((u) => ({
            id: u.id,
            name: u.name,
            username: u.username,
            isAdmin: u.isAdmin,
            groupName: u.permissionGroup?.name ?? null,
          }))}
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50">Grupos de permissão</h2>
        <Link
          href="/usuarios/grupos/novo"
          className="rounded-md border border-black/10 px-4 py-2 text-sm font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
        >
          + Novo grupo
        </Link>
      </div>

      <GroupsTable groups={groups.map((g) => ({ id: g.id, name: g.name, userCount: g.users.length }))} />
    </div>
  );
}
