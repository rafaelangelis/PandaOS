"use client";

import { useActionState } from "react";
import { createService, type ServiceFormState } from "../actions";
import { CancelButton } from "@/components/CancelButton";

const initialState: ServiceFormState = {};
const inputClass =
  "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

export function NewServiceForm() {
  const [state, formAction, pending] = useActionState(createService, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Nome</label>
        <input type="text" name="name" required className={inputClass} placeholder="Ex: Formatação de computador" />
      </div>
      <div className="flex flex-col gap-1 sm:w-48">
        <label className={labelClass}>Valor (R$)</label>
        <input type="number" name="unitPrice" step="0.01" min={0} defaultValue={0} className={inputClass} />
      </div>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {pending ? "Salvando..." : "Criar serviço"}
        </button>
        <CancelButton />
      </div>
    </form>
  );
}
