"use client";

import { useRouter } from "next/navigation";

export type UserRow = {
  id: string;
  name: string;
  username: string;
  isAdmin: boolean;
  groupName: string | null;
};

export function UsersTable({ users }: { users: UserRow[] }) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-black/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-2">Nome</th>
            <th className="px-4 py-2">Usuário</th>
            <th className="px-4 py-2">Grupo</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const href = `/usuarios/${u.id}`;
            return (
              <tr
                key={u.id}
                onClick={() => router.push(href)}
                className="cursor-pointer border-t border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                <td className="px-4 py-2">
                  {u.name} {u.isAdmin && <span className="ml-1 text-xs text-zinc-500">(admin)</span>}
                </td>
                <td className="px-4 py-2">{u.username}</td>
                <td className="px-4 py-2">{u.groupName ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
