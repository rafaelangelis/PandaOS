import Link from "next/link";
import { Fragment } from "react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { ClienteFilterInput } from "@/components/ClienteFilterInput";
import { PrintButton } from "@/components/PrintButton";

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

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

export default async function OsPorClientePage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; from?: string; to?: string }>;
}) {
  await requirePermission("relatorios", "view");
  const { cliente, from, to } = await searchParams;

  const clienteQuery = cliente?.trim();

  const entryDateFilter =
    from || to
      ? {
          ...(from && { gte: startOfDayUTC(from) }),
          ...(to && { lt: endOfDayUTC(to) }),
        }
      : undefined;

  const [customers, orders, company] = await Promise.all([
    prisma.customer.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
    clienteQuery
      ? prisma.serviceOrder.findMany({
          where: {
            customer: { name: { contains: clienteQuery } },
            ...(entryDateFilter && { entryDate: entryDateFilter }),
          },
          orderBy: { entryDate: "desc" },
          select: {
            id: true,
            number: true,
            entryDate: true,
            problem: true,
            discount: true,
            parts: { select: { description: true, quantity: true, unitPrice: true } },
            services: { select: { hours: true, unitPrice: true } },
          },
        })
      : Promise.resolve([]),
    prisma.companyInfo.findUnique({ where: { id: "singleton" } }),
  ]);

  const customerNames = [...new Set(customers.map((c) => c.name))];

  const orderTotals = orders.map((order) => {
    const totalParts = order.parts.reduce((s, p) => s + p.quantity * p.unitPrice, 0);
    const totalServices = order.services.reduce((s, sv) => s + sv.hours * sv.unitPrice, 0);
    return Math.max(0, totalParts + totalServices - order.discount);
  });
  const grandTotal = orderTotals.reduce((s, t) => s + t, 0);

  let rowCounter = 0;

  return (
    <div id="relatorio-os-cliente" className="mx-auto max-w-4xl px-6 py-10 font-sans">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          #relatorio-os-cliente {
            max-width: none !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #relatorio-os-cliente .relatorio-table-wrapper {
            border: none !important;
            border-radius: 0 !important;
            overflow: visible !important;
          }
          #relatorio-os-cliente table {
            width: 100% !important;
          }
          #relatorio-os-cliente th:first-child,
          #relatorio-os-cliente td:first-child {
            padding-left: 0 !important;
          }
          #relatorio-os-cliente th:last-child,
          #relatorio-os-cliente td:last-child {
            padding-right: 0 !important;
          }
        }
      `}</style>

      {company && (
        <div className="hidden print:flex items-center justify-center gap-4 mb-6 border-b border-black/20 pb-4">
          {company.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logoUrl} alt="Logo da empresa" className="h-20 w-20 object-contain" />
          )}
          <div className="text-center leading-tight">
            {company.name && <p className="font-semibold text-[22px]">{company.name}</p>}
            {company.legalName && <p className="text-[13px]">{company.legalName}</p>}
            {company.cnpj && <p className="text-[11px]">{company.cnpj}</p>}
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50 print:hidden">OS por Cliente</h1>
        <h1 className="hidden text-2xl font-semibold text-black print:block">Relatório dos Serviços Prestados</h1>
        {clienteQuery && orders.length > 0 && <PrintButton />}
      </div>
      <p className="mb-4 text-sm text-zinc-500 print:hidden">
        Busque um cliente para ver o número, a data e a descrição de cada OS.
      </p>

      <form
        className="mb-6 flex flex-wrap items-end gap-3 print:hidden"
        action="/relatorios/os-por-cliente"
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
          <Link href="/relatorios/os-por-cliente" className="text-sm text-zinc-500 hover:underline">
            Limpar
          </Link>
        )}
      </form>

      {!clienteQuery ? (
        <p className="text-sm text-zinc-500">Digite o nome de um cliente acima para ver o relatório.</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhuma OS encontrada para &quot;{clienteQuery}&quot;.</p>
      ) : (
        <div className="relatorio-table-wrapper overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2 print:pl-0">Nº</th>
                <th className="px-4 py-2">Nº OS</th>
                <th className="px-4 py-2 print:hidden">Data</th>
                <th className="px-4 py-2">Descrição</th>
                <th className="px-4 py-2 text-right print:pr-0">Valor</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <Fragment key={order.id}>
                  <tr className="border-t border-black/10 dark:border-white/10">
                    <td className="px-4 py-2 font-medium text-black dark:text-zinc-50 print:pl-0">
                      {++rowCounter}.
                    </td>
                    <td className="px-4 py-2">#{order.number}</td>
                    <td className="px-4 py-2 print:hidden">{formatDate(order.entryDate)}</td>
                    <td className="px-4 py-2">{order.problem ?? "—"}</td>
                    <td className="px-4 py-2 text-right print:pr-0">{currency(orderTotals[index])}</td>
                  </tr>
                  {order.parts.map((part, partIndex) => (
                    <tr
                      key={`${order.id}-part-${partIndex}`}
                      className="border-t border-black/5 text-zinc-500 dark:border-white/5 dark:text-zinc-400"
                    >
                      <td className="px-4 py-2 font-medium print:pl-0">{++rowCounter}.</td>
                      <td className="px-4 py-2">#{order.number}</td>
                      <td className="px-4 py-2 print:hidden">{formatDate(order.entryDate)}</td>
                      <td className="px-4 py-2">{part.description}</td>
                      <td className="px-4 py-2 text-right print:pr-0">
                        {currency(part.quantity * part.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-black/10 dark:border-white/10">
                <td className="px-4 py-2 font-semibold text-black dark:text-zinc-50 print:pl-0" colSpan={4}>
                  Total
                </td>
                <td className="px-4 py-2 text-right font-semibold text-black dark:text-zinc-50 print:pr-0">
                  {currency(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
