"use client";

import { useActionState } from "react";
import { updateFinancialAccount, type FinancialAccountFormState } from "../actions";

const initialState: FinancialAccountFormState = {};
const inputClass =
  "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

export function EditFinancialAccountForm({
  accountId,
  name,
  type,
  initialBalance,
}: {
  accountId: string;
  name: string;
  type: string;
  initialBalance: number;
}) {
  const updateFinancialAccountWithId = updateFinancialAccount.bind(null, accountId);
  const [state, formAction, pending] = useActionState(updateFinancialAccountWithId, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Nome</label>
        <input type="text" name="name" required defaultValue={name} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1 sm:w-48">
        <label className={labelClass}>Tipo</label>
        <select name="type" defaultValue={type} className={inputClass}>
          <option value="caixa">Caixa</option>
          <option value="banco">Banco</option>
          <option value="cartao">Cartão</option>
        </select>
      </div>
      <div className="flex flex-col gap-1 sm:w-48">
        <label className={labelClass}>Saldo inicial (R$)</label>
        <input type="number" name="initialBalance" step="0.01" defaultValue={initialBalance} className={inputClass} />
      </div>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {pending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
