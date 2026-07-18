import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission, can } from "@/lib/permissions";
import { ContasReceberTable } from "./ContasReceberTable";
import { ClienteFilterInput } from "./ClienteFilterInput";

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

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; cliente?: string; status?: string; q?: string }>;
}) {
  const user = await requirePermission("financeiro", "view");
  const canEdit = can(user, "financeiro", "edit");
  const { from, to, cliente, status, q } = await searchParams;

  const dueDateFilter =
    from || to
      ? {
          ...(from && { gte: startOfDayUTC(from) }),
          ...(to && { lt: endOfDayUTC(to) }),
        }
      : undefined;

  const hasFilter = Boolean(q);

  const [installmentsRaw, openTotal, accounts, customers] = await Promise.all([
    hasFilter
      ? prisma.saleInstallment.findMany({
          where: {
            ...(dueDateFilter && { dueDate: dueDateFilter }),
            ...(status && { status }),
          },
          orderBy: { dueDate: "asc" },
          include: { sale: { include: { customer: true, serviceOrder: true } }, account: true },
        })
      : Promise.resolve([]),
    prisma.saleInstallment.aggregate({
      where: { status: "pendente" },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.financialAccount.findMany({ orderBy: { name: "asc" } }),
    prisma.customer.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
  ]);

  const customerNames = [...new Set(customers.map((c) => c.name))];

  const clienteQuery = cliente?.trim().toLowerCase();
  const installments = clienteQuery
    ? installmentsRaw.filter((inst) => inst.sale.customer.name.toLowerCase().includes(clienteQuery))
    : installmentsRaw;

  return (
    <div className="mx-auto max-w-[96rem] px-6 py-10 font-sans">
      <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">Financeiro</h1>

      <h2 className="mb-1 text-lg font-semibold text-black dark:text-zinc-50">Contas a Receber</h2>
      <p className="mb-4 text-sm text-zinc-500">
        Total em aberto: <span className="font-medium text-black dark:text-zinc-50">{currency(openTotal._sum.amount ?? 0)}</span>{" "}
        ({openTotal._count._all} {openTotal._count._all === 1 ? "parcela" : "parcelas"})
      </p>

      <form className="mb-4 flex flex-wrap items-end gap-3" action="/financeiro" method="get" autoComplete="off">
        <input type="hidden" name="q" value="1" />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">Status</label>
          <select
            name="status"
            defaultValue={status ?? "pendente"}
            className="rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30"
          >
            <option value="">Todas</option>
            <option value="pendente">Em aberto</option>
            <option value="pago">Pagas</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">De</label>
          <input
            type="date"
            name="from"
            defaultValue={from}
            autoComplete="off"
            className="rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">Até</label>
          <input
            type="date"
            name="to"
            defaultValue={to}
            autoComplete="off"
            className="rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30"
          />
        </div>
        <ClienteFilterInput customerNames={customerNames} defaultValue={cliente} />
        <button
          type="submit"
          className="rounded-md border border-black/10 px-4 py-1.5 text-sm font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
        >
          Filtrar
        </button>
        {hasFilter && (
          <Link href="/financeiro" className="text-sm text-zinc-500 hover:underline">
            Limpar filtro
          </Link>
        )}
      </form>

      {hasFilter ? (
        <div className="mb-10">
          <ContasReceberTable
            installments={installments.map((inst) => ({
              id: inst.id,
              saleNumber: inst.sale.number,
              serviceOrderId: inst.sale.serviceOrderId,
              customerName: inst.sale.customer.name,
              number: inst.number,
              dueDateStr: inst.dueDate.toLocaleDateString("pt-BR", { timeZone: "UTC" }),
              paidAtStr: inst.paidAt ? inst.paidAt.toLocaleDateString("pt-BR") : null,
              amount: inst.amount,
              status: inst.status,
              accountName: inst.account?.name ?? null,
            }))}
            accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
            canEdit={canEdit}
          />
        </div>
      ) : (
        <p className="mb-10 text-sm text-zinc-500">
          Use os filtros acima (status, período ou cliente) para pesquisar as contas a receber.
        </p>
      )}
    </div>
  );
}
