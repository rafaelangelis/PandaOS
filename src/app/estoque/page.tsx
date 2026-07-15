import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission, can } from "@/lib/permissions";

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function EstoquePage() {
  const user = await requirePermission("estoque", "view");
  const canEdit = can(user, "estoque", "edit");

  const parts = await prisma.part.findMany({ orderBy: { name: "asc" } });
  const lowStockCount = parts.filter((p) => p.quantity <= p.minStock).length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 font-sans">
      <Link href="/" className="mb-6 inline-block text-sm text-zinc-500 hover:underline">
        ← Voltar
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Estoque</h1>
        {canEdit && (
          <Link
            href="/estoque/novo"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            + Nova peça
          </Link>
        )}
      </div>

      {lowStockCount > 0 && (
        <p className="mb-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
          {lowStockCount} {lowStockCount === 1 ? "peça está" : "peças estão"} com estoque baixo.
        </p>
      )}

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
              return (
                <tr
                  key={part.id}
                  className={`border-t border-black/10 dark:border-white/10 ${
                    low ? "bg-red-50 dark:bg-red-950/40" : ""
                  }`}
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
                      <Link href={`/estoque/${part.id}`} className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
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
    </div>
  );
}
