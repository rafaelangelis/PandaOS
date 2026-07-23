import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission, can } from "@/lib/permissions";
import { OSListTable } from "./OSListTable";

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

  // No `status` param at all defaults to "aberta" (open OS's only); an explicit
  // `status=` (empty string) means the user picked "Todas" and clears the filter.
  const effectiveStatus = status === undefined ? "aberta" : status;

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

  const [orders, distinctStatuses] = await Promise.all([
    prisma.serviceOrder.findMany({
      where: {
        ...(effectiveStatus && { status: effectiveStatus }),
        ...(entryDateFilter && { entryDate: entryDateFilter }),
      },
      orderBy: { number: "desc" },
      include: { customer: true, technician: true, parts: true, services: true },
    }),
    prisma.serviceOrder.groupBy({ by: ["status"] }),
  ]);

  const ordersWithTotal = orders.map((order) => {
    const totalParts = order.parts.reduce((s, p) => s + p.quantity * p.unitPrice, 0);
    const totalServices = order.services.reduce((s, sv) => s + sv.hours * sv.unitPrice, 0);
    return {
      id: order.id,
      number: order.number,
      customerName: order.customer.name,
      technicianName: order.technician?.name ?? null,
      status: order.status,
      entryDateStr: order.entryDate.toLocaleDateString("pt-BR", { timeZone: "UTC" }),
      total: Math.max(0, totalParts + totalServices - order.discount),
      internalNotes: order.internalNotes,
    };
  });
  const grandTotal = ordersWithTotal.reduce((s, o) => s + o.total, 0);
  const statusOptions = distinctStatuses.length
    ? distinctStatuses.map((s) => s.status)
    : ["aberta", "finalizado"];

  const statusQS = `status=${encodeURIComponent(effectiveStatus)}`;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 font-sans">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Ordens de Serviço</h1>
          {effectiveStatus && (
            <Link
              href={`/os?status=${all ? "&all=1" : ""}`}
              className="flex items-center gap-1 rounded-full bg-black/5 px-3 py-1 text-xs capitalize text-zinc-600 hover:bg-black/10 dark:bg-white/10 dark:text-zinc-300 dark:hover:bg-white/20"
            >
              {effectiveStatus} ×
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
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            + Nova OS
          </Link>
        )}
      </div>

      <form className="mb-6 flex flex-wrap items-end gap-3" action="/os" method="get">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">Status</label>
          <select
            name="status"
            defaultValue={effectiveStatus}
            className="rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30"
          >
            <option value="aberta">Aberta</option>
            <option value="finalizado">Finalizado</option>
            <option value="">Todas</option>
          </select>
        </div>
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
          {effectiveStatus ? `Nenhuma ordem de serviço com status "${effectiveStatus}" no período selecionado.` : "Nenhuma ordem de serviço no período selecionado."}
        </p>
      ) : (
        <OSListTable orders={ordersWithTotal} canEdit={canEdit} statusOptions={statusOptions} grandTotal={grandTotal} />
      )}
    </div>
  );
}
