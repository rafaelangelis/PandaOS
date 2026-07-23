import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { ClienteFilterInput } from "@/components/ClienteFilterInput";
import { PrintButton } from "@/components/PrintButton";

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function startOfDayUTC(dateStr: string) {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function endOfDayUTC(dateStr: string) {
  const d = startOfDayUTC(dateStr);
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

export default async function ContasAReceberReportPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; from?: string; to?: string }>;
}) {
  await requirePermission("relatorios", "view");
  const { cliente, from, to } = await searchParams;

  const clienteQuery = cliente?.trim();

  const dueDateFilter =
    from || to
      ? {
          ...(from && { gte: startOfDayUTC(from) }),
          ...(to && { lt: endOfDayUTC(to) }),
        }
      : undefined;

  const [customers, installments] = await Promise.all([
    prisma.customer.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
    clienteQuery
      ? prisma.saleInstallment.findMany({
          where: {
            status: { in: ["pendente", "parcial"] },
            sale: { customer: { name: { contains: clienteQuery } } },
            ...(dueDateFilter && { dueDate: dueDateFilter }),
          },
          orderBy: { dueDate: "asc" },
          include: { sale: { include: { customer: true } } },
        })
      : Promise.resolve([]),
  ]);

  const customerNames = [...new Set(customers.map((c) => c.name))];
  const totalAberto = installments.reduce((sum, inst) => sum + inst.amount, 0);

  return (
    <div id="relatorio-contas-a-receber" className="mx-auto max-w-4xl px-6 py-10 font-sans">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          #relatorio-contas-a-receber {
            max-width: none !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #relatorio-contas-a-receber .relatorio-table-wrapper {
            border: none !important;
            border-radius: 0 !important;
            overflow: visible !important;
          }
          #relatorio-contas-a-receber table {
            width: 100% !important;
          }
          #relatorio-contas-a-receber th:first-child,
          #relatorio-contas-a-receber td:first-child {
            padding-left: 0 !important;
          }
          #relatorio-contas-a-receber th:last-child,
          #relatorio-contas-a-receber td:last-child {
            padding-right: 0 !important;
          }
        }
      `}</style>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Contas a Receber</h1>
        {clienteQuery && installments.length > 0 && <PrintButton />}
      </div>
      <p className="mb-4 text-sm text-zinc-500 print:hidden">
        Busque um cliente para ver as parcelas em aberto e o total a receber.
      </p>

      <form
        className="mb-6 flex flex-wrap items-end gap-3 print:hidden"
        action="/relatorios/contas-a-receber"
        method="get"
        autoComplete="off"
      >
        <ClienteFilterInput customerNames={customerNames} defaultValue={cliente} />
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
        <button
          type="submit"
          className="rounded-md border border-black/10 px-4 py-1.5 text-sm font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
        >
          Buscar
        </button>
        {clienteQuery && (
          <Link href="/relatorios/contas-a-receber" className="text-sm text-zinc-500 hover:underline">
            Limpar
          </Link>
        )}
      </form>

      {!clienteQuery ? (
        <p className="text-sm text-zinc-500">Digite o nome de um cliente acima para ver o relatório.</p>
      ) : installments.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhuma conta em aberto encontrada para &quot;{clienteQuery}&quot;.</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-zinc-500">
            Total em aberto:{" "}
            <span className="font-medium text-black dark:text-zinc-50">{currency(totalAberto)}</span>{" "}
            ({installments.length} {installments.length === 1 ? "parcela" : "parcelas"})
          </p>
          <div className="relatorio-table-wrapper overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-2">Venda</th>
                  <th className="px-4 py-2">Cliente</th>
                  <th className="px-4 py-2">Parcela</th>
                  <th className="px-4 py-2">Vencimento</th>
                  <th className="px-4 py-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {installments.map((inst) => (
                  <tr key={inst.id} className="border-t border-black/10 dark:border-white/10">
                    <td className="px-4 py-2">
                      <Link
                        href={`/os/${inst.sale.serviceOrderId}`}
                        className="font-medium text-black hover:underline dark:text-zinc-50"
                      >
                        #{inst.sale.number}
                      </Link>
                    </td>
                    <td className="px-4 py-2">{inst.sale.customer.name}</td>
                    <td className="px-4 py-2">{inst.number}</td>
                    <td className="px-4 py-2">{formatDate(inst.dueDate)}</td>
                    <td className="px-4 py-2 text-right">{currency(inst.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
