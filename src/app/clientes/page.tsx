import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission, can } from "@/lib/permissions";

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
    include: { _count: { select: { serviceOrders: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 font-sans">
      <Link href="/" className="mb-6 inline-block text-sm text-zinc-500 hover:underline">
        ← Voltar
      </Link>

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

      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Telefone</th>
              <th className="px-4 py-2">E-mail</th>
              <th className="px-4 py-2">OS</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-black/10 dark:border-white/10">
                <td className="px-4 py-2">
                  <Link href={`/clientes/${c.id}`} className="font-medium text-black hover:underline dark:text-zinc-50">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-2">{c.phone ?? "—"}</td>
                <td className="px-4 py-2">{c.email ?? "—"}</td>
                <td className="px-4 py-2">{c._count.serviceOrders}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-zinc-500">
                  {q ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado ainda."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
