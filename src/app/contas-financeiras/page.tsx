import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission, can } from "@/lib/permissions";
import { ContasFinanceirasTable } from "./ContasFinanceirasTable";

export default async function ContasFinanceirasPage() {
  const user = await requirePermission("contasFinanceiras", "view");
  const canEdit = can(user, "contasFinanceiras", "edit");

  const accounts = await prisma.financialAccount.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 font-sans">
      <Link href="/" className="mb-6 inline-block text-sm text-zinc-500 hover:underline">
        ← Voltar
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Contas Financeiras</h1>
        {canEdit && (
          <Link
            href="/contas-financeiras/novo"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            + Nova conta
          </Link>
        )}
      </div>

      <ContasFinanceirasTable accounts={accounts} canEdit={canEdit} />
    </div>
  );
}
