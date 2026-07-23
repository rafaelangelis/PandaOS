"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export type CustomerRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
};

export function ClientesTable({
  customers,
  canEdit,
  emptyMessage,
}: {
  customers: CustomerRow[];
  canEdit: boolean;
  emptyMessage: string;
}) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-black/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-2">Nome</th>
            <th className="px-4 py-2">Telefone</th>
            <th className="px-4 py-2">E-mail</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => {
            const href = canEdit ? `/clientes/${c.id}/editar` : `/clientes/${c.id}`;
            return (
              <tr
                key={c.id}
                onClick={() => router.push(href)}
                className="cursor-pointer border-t border-black/10 hover:bg-orange-100 dark:border-white/10 dark:hover:bg-[rgba(255,165,0,0.18)]"
              >
                <td className="px-4 py-2">
                  <Link
                    href={href}
                    onClick={(e) => e.stopPropagation()}
                    className="font-medium text-black dark:text-zinc-50"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-2">{c.phone ?? "—"}</td>
                <td className="px-4 py-2">{c.email ?? "—"}</td>
              </tr>
            );
          })}
          {customers.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-4 text-center text-zinc-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
