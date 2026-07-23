import Link from "next/link";
import { requirePermission } from "@/lib/permissions";

export default async function RelatoriosPage() {
  await requirePermission("relatorios", "view");

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 font-sans">
      <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">Relatórios</h1>
      <ul className="flex flex-col gap-2">
        <li>
          <Link
            href="/relatorios/os-por-cliente"
            className="block rounded-lg border border-black/10 p-4 text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
          >
            <p className="font-medium">OS por Cliente</p>
            <p className="text-sm text-zinc-500">Número, data e problema relatado das OS de um cliente.</p>
          </Link>
        </li>
        <li>
          <Link
            href="/relatorios/contas-a-receber"
            className="block rounded-lg border border-black/10 p-4 text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
          >
            <p className="font-medium">Contas a Receber</p>
            <p className="text-sm text-zinc-500">Parcelas em aberto e total a receber de um cliente.</p>
          </Link>
        </li>
      </ul>
    </div>
  );
}
