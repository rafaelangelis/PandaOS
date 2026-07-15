import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission, can } from "@/lib/permissions";
import { MarkPaidButton } from "./MarkPaidButton";

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default async function FinanceiroPage() {
  const user = await requirePermission("financeiro", "view");
  const canEdit = can(user, "financeiro", "edit");

  const [installments, commissions] = await Promise.all([
    prisma.saleInstallment.findMany({
      orderBy: { dueDate: "asc" },
      include: { sale: { include: { customer: true, serviceOrder: true } } },
    }),
    prisma.commission.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true, sale: { include: { serviceOrder: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 font-sans">
      <Link href="/" className="mb-6 inline-block text-sm text-zinc-500 hover:underline">
        ← Voltar
      </Link>

      <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">Financeiro</h1>

      <h2 className="mb-3 text-lg font-semibold text-black dark:text-zinc-50">Contas a Receber</h2>
      <div className="mb-10 overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-2">Venda</th>
              <th className="px-4 py-2">Cliente</th>
              <th className="px-4 py-2">Parcela</th>
              <th className="px-4 py-2">Vencimento</th>
              <th className="px-4 py-2">Valor</th>
              <th className="px-4 py-2">Status</th>
              {canEdit && <th className="px-4 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {installments.map((inst) => (
              <tr key={inst.id} className="border-t border-black/10 dark:border-white/10">
                <td className="px-4 py-2">
                  <Link href={`/os/${inst.sale.serviceOrderId}`} className="hover:underline">
                    Venda #{inst.sale.number}
                  </Link>
                </td>
                <td className="px-4 py-2">{inst.sale.customer.name}</td>
                <td className="px-4 py-2">{inst.number}</td>
                <td className="px-4 py-2">{formatDate(inst.dueDate)}</td>
                <td className="px-4 py-2">{currency(inst.amount)}</td>
                <td className="px-4 py-2 capitalize">{inst.status}</td>
                {canEdit && (
                  <td className="px-4 py-2 text-right">
                    {inst.status !== "pago" && <MarkPaidButton installmentId={inst.id} />}
                  </td>
                )}
              </tr>
            ))}
            {installments.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 7 : 6} className="px-4 py-4 text-center text-zinc-500">
                  Nenhuma conta a receber ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
