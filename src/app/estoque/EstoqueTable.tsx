"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export type PartRow = {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  minStock: number;
  unitPrice: number;
};

export function EstoqueTable({ parts, canEdit }: { parts: PartRow[]; canEdit: boolean }) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-black/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-2">Nome</th>
            <th className="px-4 py-2">SKU</th>
            <th className="px-4 py-2">Qtd</th>
            <th className="px-4 py-2">Mínimo</th>
            <th className="px-4 py-2">Preço</th>
            {canEdit && <th className="px-4 py-2"></th>}
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => {
            const low = part.quantity <= part.minStock;
            const href = `/estoque/${part.id}`;
            return (
              <tr
                key={part.id}
                onClick={canEdit ? () => router.push(href) : undefined}
                className={`border-t border-black/10 dark:border-white/10 ${
                  canEdit ? "cursor-pointer hover:bg-black/5 dark:hover:bg-white/5" : ""
                } ${low ? "bg-red-50 dark:bg-red-950/40" : ""}`}
              >
                <td className="px-4 py-2">{part.name}</td>
                <td className="px-4 py-2">{part.sku ?? "—"}</td>
                <td className={`px-4 py-2 ${low ? "font-semibold text-red-700 dark:text-red-400" : ""}`}>
                  {part.quantity}
                </td>
                <td className="px-4 py-2">{part.minStock}</td>
                <td className="px-4 py-2">{currency(part.unitPrice)}</td>
                {canEdit && (
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={href}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
                    >
                      Editar
                    </Link>
                  </td>
                )}
              </tr>
            );
          })}
          {parts.length === 0 && (
            <tr>
              <td colSpan={canEdit ? 6 : 5} className="px-4 py-4 text-center text-zinc-500">
                Nenhuma peça cadastrada ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
