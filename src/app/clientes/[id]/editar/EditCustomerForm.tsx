"use client";

import { useActionState } from "react";
import { updateCustomer, type CustomerFormState } from "../../actions";
import { CancelButton } from "@/components/CancelButton";

const initialState: CustomerFormState = {};
const inputClass =
  "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

export function EditCustomerForm({
  customerId,
  name,
  phone,
  email,
  document,
}: {
  customerId: string;
  name: string;
  phone: string | null;
  email: string | null;
  document: string | null;
}) {
  const updateCustomerWithId = updateCustomer.bind(null, customerId);
  const [state, formAction, pending] = useActionState(updateCustomerWithId, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Nome</label>
        <input type="text" name="name" required defaultValue={name} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Telefone</label>
        <input type="text" name="phone" defaultValue={phone ?? ""} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>E-mail</label>
        <input type="email" name="email" defaultValue={email ?? ""} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>CPF/CNPJ</label>
        <input type="text" name="document" defaultValue={document ?? ""} className={inputClass} />
      </div>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {pending ? "Salvando..." : "Salvar alterações"}
        </button>
        <CancelButton />
      </div>
    </form>
  );
}
