"use client";

import { useRouter } from "next/navigation";

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const TYPE_LABELS: Record<string, string> = {
  caixa: "Caixa",
  banco: "Banco",
  cartao: "Cartão",
};

export type FinancialAccountRow = {
  id: string;
  name: string;
  type: string;
  initialBalance: number;
};

export function ContasFinanceirasTable({
  accounts,
  canEdit,
}: {
  accounts: FinancialAccountRow[];
  canEdit: boolean;
}) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-black/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-2">Nome</th>
            <th className="px-4 py-2">Tipo</th>
            <th className="px-4 py-2">Saldo inicial</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => {
            const href = `/contas-financeiras/${account.id}`;
            return (
              <tr
                key={account.id}
                onClick={canEdit ? () => router.push(href) : undefined}
                className={`border-t border-black/10 dark:border-white/10 ${
                  canEdit ? "cursor-pointer hover:bg-orange-100 dark:hover:bg-[rgba(255,165,0,0.18)]" : ""
                }`}
              >
                <td className="px-4 py-2">{account.name}</td>
                <td className="px-4 py-2">{TYPE_LABELS[account.type] ?? account.type}</td>
                <td className="px-4 py-2">{currency(account.initialBalance)}</td>
              </tr>
            );
          })}
          {accounts.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-4 text-center text-zinc-500">
                Nenhuma conta financeira cadastrada ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
