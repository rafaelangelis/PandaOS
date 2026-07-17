import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission, can } from "@/lib/permissions";
import { SaleForm } from "./SaleForm";

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: Date | null) {
  return date ? date.toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—";
}

function formatDateTime(date: Date | null) {
  return date ? date.toLocaleString("pt-BR") : "—";
}

export default async function OSDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("os", "view");
  const canManageSale = can(user, "financeiro", "edit");
  const canEditOS = can(user, "os", "edit");

  const { id } = await params;
  const order = await prisma.serviceOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      technician: true,
      parts: true,
      services: true,
      sale: { include: { installments: true } },
    },
  });

  if (!order) notFound();

  const totalParts = order.parts.reduce((s, p) => s + p.quantity * p.unitPrice, 0);
  const totalServices = order.services.reduce((s, sv) => s + sv.hours * sv.unitPrice, 0);
  const total = Math.max(0, totalParts + totalServices - order.discount);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 font-sans">
      <Link href="/os" className="mb-6 inline-block text-sm text-zinc-500 hover:underline">
        ← Voltar para Ordens de Serviço
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          OS #{order.number}
        </h1>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-black/5 px-3 py-1 text-sm capitalize dark:bg-white/10">
            {order.status}
          </span>
          {canEditOS && (
            <Link
              href={`/os/${order.id}/editar`}
              className="rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
            >
              Editar OS
            </Link>
          )}
        </div>
      </div>

      <div className="mb-6 grid gap-4 rounded-lg border border-black/10 p-6 dark:border-white/10 sm:grid-cols-2">
        <div>
          <p className="text-sm text-zinc-500">Cliente</p>
          <Link href={`/clientes/${order.customer.id}`} className="text-black hover:underline dark:text-zinc-50">
            {order.customer.name}
          </Link>
          {order.customer.phone && <p className="text-sm text-zinc-500">{order.customer.phone}</p>}
        </div>
        <div>
          <p className="text-sm text-zinc-500">Técnico</p>
          <p className="text-black dark:text-zinc-50">{order.technician?.name ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">Equipamento</p>
          <p className="text-black dark:text-zinc-50">{order.equipment ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">Número de série</p>
          <p className="text-black dark:text-zinc-50">{order.serialNumber ?? "—"}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm text-zinc-500">Problema relatado</p>
          <p className="text-black dark:text-zinc-50">{order.problem ?? "—"}</p>
        </div>
        {order.internalNotes && (
          <div className="sm:col-span-2">
            <p className="text-sm text-zinc-500">Observações internas</p>
            <p className="text-black dark:text-zinc-50">{order.internalNotes}</p>
          </div>
        )}
      </div>

      <div className="mb-6 grid gap-4 rounded-lg border border-black/10 p-6 dark:border-white/10 sm:grid-cols-4">
        <div>
          <p className="text-sm text-zinc-500">Entrada</p>
          <p className="text-black dark:text-zinc-50">{formatDate(order.entryDate)}</p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">Prevista</p>
          <p className="text-black dark:text-zinc-50">{formatDate(order.expectedDate)}</p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">Término</p>
          <p className="text-black dark:text-zinc-50">{formatDate(order.completionDate)}</p>
        </div>
        <div>
          <p className="text-sm text-zinc-500">Saída</p>
          <p className="text-black dark:text-zinc-50">{formatDate(order.exitDate)}</p>
        </div>
      </div>

      {order.parts.length > 0 && (
        <div className="mb-6 rounded-lg border border-black/10 p-6 dark:border-white/10">
          <h2 className="mb-3 text-lg font-semibold text-black dark:text-zinc-50">Peças</h2>
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-1">Descrição</th>
                <th className="py-1">Qtd</th>
                <th className="py-1">Preço unit.</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.parts.map((p) => (
                <tr key={p.id} className="border-t border-black/5 dark:border-white/5">
                  <td className="py-1">{p.description}</td>
                  <td className="py-1">{p.quantity}</td>
                  <td className="py-1">{currency(p.unitPrice)}</td>
                  <td className="py-1 text-right">{currency(p.quantity * p.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {order.services.length > 0 && (
        <div className="mb-6 rounded-lg border border-black/10 p-6 dark:border-white/10">
          <h2 className="mb-3 text-lg font-semibold text-black dark:text-zinc-50">Serviços executados</h2>
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-1">Descrição</th>
                <th className="py-1">Início</th>
                <th className="py-1">Fim</th>
                <th className="py-1 text-right">Horas</th>
                <th className="py-1 text-right">Valor/hora</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.services.map((s) => (
                <tr key={s.id} className="border-t border-black/5 dark:border-white/5">
                  <td className="py-1">{s.description}</td>
                  <td className="py-1">{formatDateTime(s.startedAt)}</td>
                  <td className="py-1">{formatDateTime(s.endedAt)}</td>
                  <td className="py-1 text-right">{s.hours}</td>
                  <td className="py-1 text-right">{currency(s.unitPrice)}</td>
                  <td className="py-1 text-right">{currency(s.hours * s.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mb-6 flex flex-col items-end gap-1 rounded-lg border border-black/10 p-6 dark:border-white/10">
        <p className="text-sm text-zinc-500">Peças: {currency(totalParts)}</p>
        <p className="text-sm text-zinc-500">Serviços: {currency(totalServices)}</p>
        {order.discount > 0 && <p className="text-sm text-zinc-500">Desconto: -{currency(order.discount)}</p>}
        <p className="text-lg font-semibold text-black dark:text-zinc-50">Total: {currency(total)}</p>
      </div>

      {canManageSale && !order.sale && <SaleForm serviceOrderId={order.id} />}

      {order.sale && (
        <div className="rounded-lg border border-black/10 p-6 dark:border-white/10">
          <h2 className="mb-3 text-lg font-semibold text-black dark:text-zinc-50">
            Venda #{order.sale.number}
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            Forma de pagamento: {order.sale.paymentMethod} — Total: {currency(order.sale.totalAmount)}
          </p>

          <h3 className="mb-2 text-sm font-semibold text-black dark:text-zinc-50">Parcelas</h3>
          <table className="mb-4 w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="py-1">Nº</th>
                <th className="py-1">Vencimento</th>
                <th className="py-1">Valor</th>
                <th className="py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {order.sale.installments.map((inst) => (
                <tr key={inst.id} className="border-t border-black/5 dark:border-white/5">
                  <td className="py-1">{inst.number}</td>
                  <td className="py-1">{formatDate(inst.dueDate)}</td>
                  <td className="py-1">{currency(inst.amount)}</td>
                  <td className="py-1 capitalize">{inst.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
