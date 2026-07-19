"use client";

import { useRouter } from "next/navigation";

export type GroupRow = {
  id: string;
  name: string;
  userCount: number;
};

export function GroupsTable({ groups }: { groups: GroupRow[] }) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-black/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-2">Grupo</th>
            <th className="px-4 py-2">Usuários</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => {
            const href = `/usuarios/grupos/${g.id}`;
            return (
              <tr
                key={g.id}
                onClick={() => router.push(href)}
                className="cursor-pointer border-t border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                <td className="px-4 py-2">{g.name}</td>
                <td className="px-4 py-2">{g.userCount}</td>
              </tr>
            );
          })}
          {groups.length === 0 && (
            <tr>
              <td colSpan={2} className="px-4 py-4 text-center text-zinc-500">
                Nenhum grupo cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
