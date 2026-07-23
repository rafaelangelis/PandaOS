"use client";

import { useActionState, useRef } from "react";
import { updatePart, type PartFormState } from "../actions";
import { CancelButton } from "@/components/CancelButton";
import { ConfirmSaveButton } from "@/components/ConfirmSaveButton";

const initialState: PartFormState = {};
const inputClass =
  "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

export function EditPartForm({
  partId,
  name,
  sku,
  quantity,
  minStock,
  unitPrice,
}: {
  partId: string;
  name: string;
  sku: string | null;
  quantity: number;
  minStock: number;
  unitPrice: number;
}) {
  const updatePartWithId = updatePart.bind(null, partId);
  const [state, formAction, pending] = useActionState(updatePartWithId, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Nome</label>
        <input type="text" name="name" required defaultValue={name} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>SKU (opcional)</label>
        <input type="text" name="sku" defaultValue={sku ?? ""} className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Quantidade em estoque</label>
          <input
            type="text"
            inputMode="numeric"
            data-numeric="integer"
            name="quantity"
            defaultValue={quantity}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Estoque mínimo</label>
          <input
            type="text"
            inputMode="numeric"
            data-numeric="integer"
            name="minStock"
            defaultValue={minStock}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Preço (R$)</label>
          <input
            type="text"
            inputMode="decimal"
            data-numeric="decimal"
            name="unitPrice"
            defaultValue={unitPrice}
            className={inputClass}
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <div className="flex items-center gap-2">
        <ConfirmSaveButton
          formRef={formRef}
          pending={pending}
          label="Salvar alterações"
          className="rounded-md bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        />
        <CancelButton />
      </div>
    </form>
  );
}
