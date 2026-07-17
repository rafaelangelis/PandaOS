import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { EditFinancialAccountForm } from "./EditFinancialAccountForm";

export default async function EditarContaFinanceiraPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("contasFinanceiras", "edit");

  const { id } = await params;
  const account = await prisma.financialAccount.findUnique({ where: { id } });

  if (!account) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 font-sans">
      <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">Editar conta financeira</h1>
      <EditFinancialAccountForm
        accountId={account.id}
        name={account.name}
        type={account.type}
        initialBalance={account.initialBalance}
      />
    </div>
  );
}
