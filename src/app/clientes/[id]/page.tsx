import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission, can } from "@/lib/permissions";

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("clientes", "view");
  const canEdit = can(user, "clientes", "edit");
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      serviceOrders: {
        orderBy: { number: "desc" },
        include: { parts: true, services: true, technician: true },
      },
    },
  });
  if (!customer) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 font-sans">
      <Link href="/clientes" className="mb-6 inline-block text-sm text-zinc-500 hover:underline">
        ← Voltar para Clientes
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">{customer.name}</h1>
        {canEdit && (
          <Link
            href={`/clientes/${customer.id}/editar`}
            className="rounded-md border border-black/10 px-4 py-2 text-sm font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
          >
            Editar
          </Link>
        )}
      </div>

      <div className="mb-6 grid gap-4 rounded-lg border border-black/10 p-6 dark:border-white/10 sm:grid-cols-3">
        <div>
          <p className="text-sm text-zinc-500">Telefone</p>
          <p className="text-black dark:text-zinc-50">{customer.phone ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">E-mail</p>
          <p className="text-black dark:text-zinc-50">{customer.email ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">CPF/CNPJ</p>
          <p className="text-black dark:text-zinc-50">{customer.document ?? "—"}</p>
        </div>
      </div>

      <h2 className="mb-3 text-lg font-semibold text-black dark:text-zinc-50">
        Histórico de Ordens de Serviço
      </h2>
      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2">Nº</th>
              <th className="px-4 py-2">Entrada</th>
              <th className="px-4 py-2">Técnico</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {customer.serviceOrders.map((order) => {
              const totalParts = order.parts.reduce((s, p) => s + p.quantity * p.unitPrice, 0);
              const totalServices = order.services.reduce((s, sv) => s + sv.unitPrice, 0);
              const total = Math.max(0, totalParts + totalServices - order.discount);
              return (
                <tr key={order.id} className="border-t border-black/10 dark:border-white/10">
                  <td className="px-4 py-2">
                    <Link href={`/os/${order.id}`} className="font-medium text-black hover:underline dark:text-zinc-50">
                      #{order.number}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{formatDate(order.entryDate)}</td>
                  <td className="px-4 py-2">{order.technician?.name ?? "—"}</td>
                  <td className="px-4 py-2 capitalize">{order.status}</td>
                  <td className="px-4 py-2 text-right">{currency(total)}</td>
                </tr>
              );
            })}
            {customer.serviceOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-zinc-500">
                  Nenhuma OS registrada para este cliente ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
