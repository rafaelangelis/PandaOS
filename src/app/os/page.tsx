import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission, can } from "@/lib/permissions";

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function startOfDayUTC(dateStr: string) {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function endOfDayUTC(dateStr: string) {
  const d = startOfDayUTC(dateStr);
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

export default async function OSListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string; to?: string; all?: string }>;
}) {
  const user = await requirePermission("os", "view");
  const canEdit = can(user, "os", "edit");
  const { status, from, to, all } = await searchParams;

  const todayStr = new Date().toISOString().slice(0, 10);
  const showingToday = !all && !from && !to;
  const effectiveFrom = showingToday ? todayStr : from;
  const effectiveTo = showingToday ? todayStr : to;

  const entryDateFilter =
    !all && (effectiveFrom || effectiveTo)
      ? {
          ...(effectiveFrom && { gte: startOfDayUTC(effectiveFrom) }),
          ...(effectiveTo && { lt: endOfDayUTC(effectiveTo) }),
        }
      : undefined;

  const orders = await prisma.serviceOrder.findMany({
    where: {
      ...(status && { status }),
      ...(entryDateFilter && { entryDate: entryDateFilter }),
    },
    orderBy: { number: "desc" },
    include: { customer: true, technician: true, parts: true, services: true },
  });

  const statusQS = status ? `status=${encodeURIComponent(status)}` : "";

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 font-sans">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Ordens de Serviço</h1>
          {status && (
            <Link
              href={`/os${all ? "?all=1" : ""}`}
              className="flex items-center gap-1 rounded-full bg-black/5 px-3 py-1 text-xs capitalize text-zinc-600 hover:bg-black/10 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/20"
            >
              {status} ×
            </Link>
          )}
          {showingToday && (
            <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
              Hoje
            </span>
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

      <form className="mb-6 flex flex-wrap items-end gap-3" action="/os" method="get">
        {status && <input type="hidden" name="status" value={status} />}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">De</label>
          <input
            type="date"
            name="from"
            defaultValue={all ? "" : effectiveFrom}
            className="rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">Até</label>
          <input
            type="date"
            name="to"
            defaultValue={all ? "" : effectiveTo}
            className="rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30"
          />
        </div>
        <button
          type="submit"
          className="rounded-md border border-black/10 px-4 py-1.5 text-sm font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
        >
          Filtrar
        </button>
        <Link
          href={`/os?all=1${statusQS ? `&${statusQS}` : ""}`}
          className="text-sm text-zinc-500 hover:underline"
        >
          Ver todas as OS
        </Link>
      </form>

      {orders.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {status ? `Nenhuma ordem de serviço com status "${status}" no período selecionado.` : "Nenhuma ordem de serviço no período selecionado."}
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
                const totalServices = order.services.reduce((s, sv) => s + sv.hours * sv.unitPrice, 0);
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
