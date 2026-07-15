import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission, can } from "@/lib/permissions";

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function OSListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requirePermission("os", "view");
  const canEdit = can(user, "os", "edit");
  const { status } = await searchParams;

  const orders = await prisma.serviceOrder.findMany({
    where: status ? { status } : undefined,
    orderBy: { number: "desc" },
    include: { customer: true, technician: true, parts: true, services: true },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Ordens de Serviço</h1>
          {status && (
            <Link
              href="/os"
              className="flex items-center gap-1 rounded-full bg-black/5 px-3 py-1 text-xs capitalize text-zinc-600 hover:bg-black/10 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/20"
            >
              {status} ×
            </Link>
          )}
        </div>
        {canEdit && (
          <Link
            href="/os/novo"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            + Nova OS
          </Link>
        )}
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {status ? `Nenhuma ordem de serviço com status "${status}".` : "Nenhuma ordem de serviço cadastrada ainda."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2">Nº</th>
                <th className="px-4 py-2">Cliente</th>
                <th className="px-4 py-2">Técnico</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Entrada</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
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
                    <td className="px-4 py-2">{order.customer.name}</td>
                    <td className="px-4 py-2">{order.technician?.name ?? "—"}</td>
                    <td className="px-4 py-2 capitalize">{order.status}</td>
                    <td className="px-4 py-2">
                      {order.entryDate.toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                    </td>
                    <td className="px-4 py-2 text-right">{currency(total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
