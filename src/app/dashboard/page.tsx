import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, can } from "@/lib/permissions";

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const showOS = can(user, "os", "view");
  const showFinanceiro = can(user, "financeiro", "view");

  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  const startOfNextMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1));
  const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  const [statusCounts, salesThisMonth, pendingInstallments] = await Promise.all([
    showOS
      ? prisma.serviceOrder.groupBy({ by: ["status"], _count: { _all: true } })
      : Promise.resolve([]),
    showFinanceiro
      ? prisma.sale.findMany({
          where: { createdAt: { gte: startOfMonth, lt: startOfNextMonth } },
          select: { totalAmount: true },
        })
      : Promise.resolve([]),
    showFinanceiro
      ? prisma.saleInstallment.findMany({
          where: { status: "pendente" },
          select: { amount: true, dueDate: true },
        })
      : Promise.resolve([]),
  ]);

  const faturamentoMes = salesThisMonth.reduce((s, sale) => s + sale.totalAmount, 0);
  const totalReceber = pendingInstallments.reduce((s, inst) => s + inst.amount, 0);
  const atrasadas = pendingInstallments.filter((inst) => inst.dueDate < todayUTC);
  const totalAtrasado = atrasadas.reduce((s, inst) => s + inst.amount, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 font-sans">
      <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">Dashboard</h1>

      {!showOS && !showFinanceiro && (
        <p className="text-sm text-zinc-500">Você não tem permissão para ver nenhum indicador ainda.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {showOS && (
          <div className="rounded-lg border border-black/10 p-6 dark:border-white/10">
            <h2 className="mb-4 text-sm font-medium text-zinc-500">OS por status</h2>
            {statusCounts.length === 0 ? (
              <p className="text-sm text-zinc-500">Nenhuma OS cadastrada ainda.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {statusCounts.map((s) => (
                  <Link
                    key={s.status}
                    href={`/os?status=${encodeURIComponent(s.status)}`}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 capitalize hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <span className="text-black dark:text-zinc-50">{s.status}</span>
                    <span className="text-zinc-500">{s._count._all}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {showFinanceiro && (
          <div className="rounded-lg border border-black/10 p-6 dark:border-white/10">
            <h2 className="mb-1 text-sm font-medium text-zinc-500">Faturamento do mês</h2>
            <p className="text-2xl font-semibold text-black dark:text-zinc-50">{currency(faturamentoMes)}</p>
            <p className="mt-1 text-sm text-zinc-500">
              {salesThisMonth.length} {salesThisMonth.length === 1 ? "venda" : "vendas"}
            </p>
          </div>
        )}

        {showFinanceiro && (
          <div className="rounded-lg border border-black/10 p-6 dark:border-white/10 sm:col-span-2">
            <h2 className="mb-1 text-sm font-medium text-zinc-500">Contas a receber</h2>
            <p className="text-2xl font-semibold text-black dark:text-zinc-50">{currency(totalReceber)}</p>
            <p className="mt-1 text-sm text-zinc-500">
              {pendingInstallments.length} {pendingInstallments.length === 1 ? "parcela pendente" : "parcelas pendentes"}
              {atrasadas.length > 0 && (
                <>
                  {" — "}
                  <span className="text-red-600 dark:text-red-400">
                    {atrasadas.length} {atrasadas.length === 1 ? "atrasada" : "atrasadas"} ({currency(totalAtrasado)})
                  </span>
                </>
              )}
            </p>
            <Link href="/financeiro" className="mt-3 inline-block text-sm text-black hover:underline dark:text-zinc-50">
              Ver contas a receber →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
