"use client";

import { useState, useTransition } from "react";
import { markInstallmentPaid } from "@/app/vendas/actions";
import type { FinancialAccountOption } from "./ContasReceberTable";

export function MarkPaidButton({
  installmentId,
  accounts,
}: {
  installmentId: string;
  accounts: FinancialAccountOption[];
}) {
  const [accountId, setAccountId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await markInstallmentPaid(installmentId, accountId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
      <select
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
        className="rounded-md border border-black/10 bg-transparent px-2 py-1 text-xs text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30"
        aria-label="Conta que recebeu"
      >
        <option value="">Conta...</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={pending}
        onClick={handleClick}
        className="text-sm font-medium text-zinc-600 underline hover:text-black disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        {pending ? "Marcando..." : "Marcar como pago"}
      </button>
    </div>
  );
}
