import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission, can } from "@/lib/permissions";

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function ServicosPage() {
  const user = await requirePermission("servicos", "view");
  const canEdit = can(user, "servicos", "edit");

  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 font-sans">
      <Link href="/" className="mb-6 inline-block text-sm text-zinc-500 hover:underline">
        ← Voltar
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Serviços</h1>
        {canEdit && (
          <Link
            href="/servicos/novo"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            + Novo serviço
          </Link>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Valor</th>
              {canEdit && <th className="px-4 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-t border-black/10 dark:border-white/10">
                <td className="px-4 py-2">{service.name}</td>
                <td className="px-4 py-2">{currency(service.unitPrice)}</td>
                {canEdit && (
                  <td className="px-4 py-2 text-right">
                    <Link href={`/servicos/${service.id}`} className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
                      Editar
                    </Link>
                  </td>
                )}
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 3 : 2} className="px-4 py-4 text-center text-zinc-500">
                  Nenhum serviço cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
