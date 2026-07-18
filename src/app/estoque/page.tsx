import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission, can } from "@/lib/permissions";
import { EstoqueTable } from "./EstoqueTable";

export default async function EstoquePage() {
  const user = await requirePermission("estoque", "view");
  const canEdit = can(user, "estoque", "edit");

  const parts = await prisma.part.findMany({ orderBy: { name: "asc" } });
  const lowStockCount = parts.filter((p) => p.quantity <= p.minStock).length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 font-sans">
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

      <EstoqueTable parts={parts} canEdit={canEdit} />
    </div>
  );
}
