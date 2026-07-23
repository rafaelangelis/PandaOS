"use client";

import { useActionState, useRef } from "react";
import { updateCustomer, type CustomerFormState } from "../../actions";
import { CancelButton } from "@/components/CancelButton";
import { CpfCnpjInput } from "../../CpfCnpjInput";
import { PhoneInput } from "@/components/PhoneInput";
import { CepInput } from "@/components/CepInput";
import { ConfirmSaveButton } from "@/components/ConfirmSaveButton";

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
  address,
  addressNumber,
  neighborhood,
  city,
  zipCode,
}: {
  customerId: string;
  name: string;
  phone: string | null;
  email: string | null;
  document: string | null;
  address: string | null;
  addressNumber: string | null;
  neighborhood: string | null;
  city: string | null;
  zipCode: string | null;
}) {
  const updateCustomerWithId = updateCustomer.bind(null, customerId);
  const [state, formAction, pending] = useActionState(updateCustomerWithId, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Nome</label>
        <input type="text" name="name" required defaultValue={name} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Telefone</label>
        <PhoneInput defaultValue={phone} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>E-mail</label>
        <input type="email" name="email" defaultValue={email ?? ""} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>CPF/CNPJ</label>
        <CpfCnpjInput defaultValue={document} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>CEP</label>
        <CepInput defaultValue={zipCode} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Endereço</label>
        <input type="text" name="address" defaultValue={address ?? ""} className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Número</label>
          <input type="text" name="addressNumber" defaultValue={addressNumber ?? ""} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Bairro</label>
          <input type="text" name="neighborhood" defaultValue={neighborhood ?? ""} className={inputClass} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Cidade</label>
        <input type="text" name="city" defaultValue={city ?? ""} className={inputClass} />
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
