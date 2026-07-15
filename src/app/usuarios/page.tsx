import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

export default async function UsuariosPage() {
  await requirePermission("usuarios", "view");

  const [users, groups] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: "asc" }, include: { permissionGroup: true } }),
    prisma.permissionGroup.findMany({ orderBy: { name: "asc" }, include: { users: true } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 font-sans">
      <Link href="/" className="mb-6 inline-block text-sm text-zinc-500 hover:underline">
        ← Voltar
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Usuários</h1>
        <Link
          href="/usuarios/novo"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          + Novo usuário
        </Link>
      </div>

      <div className="mb-10 overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Usuário</th>
              <th className="px-4 py-2">Grupo</th>
              <th className="px-4 py-2">Comissão</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-black/10 dark:border-white/10">
                <td className="px-4 py-2">
                  {u.name} {u.isAdmin && <span className="ml-1 text-xs text-zinc-500">(admin)</span>}
                </td>
                <td className="px-4 py-2">{u.username}</td>
                <td className="px-4 py-2">{u.permissionGroup?.name ?? "—"}</td>
                <td className="px-4 py-2">{u.commissionRate}%</td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/usuarios/${u.id}`} className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2">Grupo</th>
              <th className="px-4 py-2">Usuários</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.id} className="border-t border-black/10 dark:border-white/10">
                <td className="px-4 py-2">{g.name}</td>
                <td className="px-4 py-2">{g.users.length}</td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/usuarios/grupos/${g.id}`} className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {groups.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-center text-zinc-500">
                  Nenhum grupo cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
