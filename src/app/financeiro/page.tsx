import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission, can } from "@/lib/permissions";
import { ContasReceberTable } from "./ContasReceberTable";

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

  const [installmentsRaw, commissions, openTotal] = await Promise.all([
    hasFilter
      ? prisma.saleInstallment.findMany({
          where: {
            ...(dueDateFilter && { dueDate: dueDateFilter }),
            ...(status && { status }),
          },
          orderBy: { dueDate: "asc" },
          include: { sale: { include: { customer: true, serviceOrder: true } } },
        })
      : Promise.resolve([]),
    prisma.commission.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true, sale: { include: { serviceOrder: true } } },
    }),
    prisma.saleInstallment.aggregate({
      where: { status: "pendente" },
      _sum: { amount: true },
      _count: { _all: true },
    }),
  ]);

  const clienteQuery = cliente?.trim().toLowerCase();
  const installments = clienteQuery
    ? installmentsRaw.filter((inst) => inst.sale.customer.name.toLowerCase().includes(clienteQuery))
    : installmentsRaw;

  return (
    <div className="mx-auto max-w-[96rem] px-6 py-10 font-sans">
      <Link href="/" className="mb-6 inline-block text-sm text-zinc-500 hover:underline">
        ← Voltar
      </Link>

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
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">Cliente</label>
          <input
            type="text"
            name="cliente"
            defaultValue={cliente}
            autoComplete="off"
            placeholder="Nome do cliente"
            className="rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30"
          />
        </div>
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
            }))}
            canEdit={canEdit}
          />
        </div>
      ) : (
        <p className="mb-10 text-sm text-zinc-500">
          Use os filtros acima (status, período ou cliente) para pesquisar as contas a receber.
        </p>
      )}

      <h2 className="mb-3 text-lg font-semibold text-black dark:text-zinc-50">Comissões</h2>
      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2">Técnico</th>
              <th className="px-4 py-2">Venda</th>
              <th className="px-4 py-2">Base (serviços)</th>
              <th className="px-4 py-2">Taxa</th>
              <th className="px-4 py-2">Comissão</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((c) => (
              <tr key={c.id} className="border-t border-black/10 dark:border-white/10">
                <td className="px-4 py-2">{c.user.name}</td>
                <td className="px-4 py-2">
                  <Link href={`/os/${c.sale.serviceOrder.id}`} className="hover:underline">
                    Venda #{c.sale.number}
                  </Link>
                </td>
                <td className="px-4 py-2">{currency(c.baseAmount)}</td>
                <td className="px-4 py-2">{c.rate}%</td>
                <td className="px-4 py-2">{currency(c.amount)}</td>
              </tr>
            ))}
            {commissions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-zinc-500">
                  Nenhuma comissão gerada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
