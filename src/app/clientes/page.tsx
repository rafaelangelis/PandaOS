import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission, can } from "@/lib/permissions";
import { ClientesTable } from "./ClientesTable";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requirePermission("clientes", "view");
  const canEdit = can(user, "clientes", "edit");
  const { q } = await searchParams;

  const customers = await prisma.customer.findMany({
    where: q ? { name: { contains: q } } : undefined,
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 font-sans">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Clientes</h1>
        {canEdit && (
          <Link
            href="/clientes/novo"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            + Novo cliente
          </Link>
        )}
      </div>

      <form className="mb-4" action="/clientes" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome..."
          className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30 sm:w-80"
        />
      </form>

      <ClientesTable
        customers={customers.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
        }))}
        canEdit={canEdit}
        emptyMessage={q ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado ainda."}
      />
    </div>
  );
}
