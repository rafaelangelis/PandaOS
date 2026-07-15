"use client";

import { useActionState, useState } from "react";
import { createSale, type SaleState } from "@/app/vendas/actions";

const initialState: SaleState = {};
const inputClass =
  "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

const PAYMENT_METHODS = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "Pix" },
  { value: "cartao_credito", label: "Cartão de crédito" },
  { value: "cartao_debito", label: "Cartão de débito" },
  { value: "crediario", label: "Crediário" },
];

function todayLocalDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function SaleForm({ serviceOrderId }: { serviceOrderId: string }) {
  const [state, formAction, pending] = useActionState(createSale, initialState);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        Converter em Venda
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border border-black/10 p-6 dark:border-white/10">
      <input type="hidden" name="serviceOrderId" value={serviceOrderId} />
      <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Converter em Venda</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Forma de pagamento</label>
          <select name="paymentMethod" required className={inputClass} defaultValue="">
            <option value="" disabled>
              Selecione
            </option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Nº de parcelas</label>
          <input type="number" name="installmentsCount" min={1} defaultValue={1} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>1º vencimento</label>
          <input type="date" name="firstDueDate" required defaultValue={todayLocalDate()} className={inputClass} />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {pending ? "Gerando..." : "Confirmar venda"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-black/10 px-5 py-2 text-sm font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
