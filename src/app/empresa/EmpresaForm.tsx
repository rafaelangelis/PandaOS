"use client";

import { useActionState, useRef, useState } from "react";
import { updateCompanyInfo, type CompanyInfoState } from "./actions";
import { CnpjInput } from "@/components/CnpjInput";
import { PhoneInput } from "@/components/PhoneInput";
import { CepInput } from "@/components/CepInput";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const initialState: CompanyInfoState = {};
const inputClass =
  "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

export function EmpresaForm({
  name,
  legalName,
  cnpj,
  address,
  addressNumber,
  neighborhood,
  zipCode,
  city,
  phone,
  logoUrl,
  hasExistingData,
}: {
  name: string | null;
  legalName: string | null;
  cnpj: string | null;
  address: string | null;
  addressNumber: string | null;
  neighborhood: string | null;
  zipCode: string | null;
  city: string | null;
  phone: string | null;
  logoUrl: string | null;
  hasExistingData: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateCompanyInfo, initialState);
  const [preview, setPreview] = useState<string | null>(logoUrl);
  const [fileName, setFileName] = useState<string | null>(null);
  const [confirmingSave, setConfirmingSave] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4" autoComplete="off">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Nome</label>
        <input type="text" name="name" defaultValue={name ?? ""} className={inputClass} autoComplete="off" />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Razão Social</label>
        <input type="text" name="legalName" defaultValue={legalName ?? ""} className={inputClass} autoComplete="off" />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>CNPJ</label>
        <CnpjInput defaultValue={cnpj} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Telefone</label>
        <PhoneInput defaultValue={phone} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>CEP</label>
        <CepInput defaultValue={zipCode} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Endereço</label>
        <input type="text" name="address" defaultValue={address ?? ""} className={inputClass} autoComplete="off" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Número</label>
          <input type="text" name="addressNumber" defaultValue={addressNumber ?? ""} className={inputClass} autoComplete="off" />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Bairro</label>
          <input type="text" name="neighborhood" defaultValue={neighborhood ?? ""} className={inputClass} autoComplete="off" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Cidade</label>
        <input type="text" name="city" defaultValue={city ?? ""} className={inputClass} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-2">
        <label className={labelClass}>Logo da empresa</label>
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Logo da empresa" className="h-20 w-20 rounded-md border border-black/10 object-contain dark:border-white/10" />
        )}
        <input
          ref={fileInputRef}
          type="file"
          name="logo"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setPreview(URL.createObjectURL(file));
              setFileName(file.name);
            }
          }}
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md border border-black/10 px-4 py-1.5 text-sm font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
          >
            Adicionar imagem
          </button>
          {fileName && <span className="text-sm text-zinc-500">{fileName}</span>}
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && !pending && (
        <p className="text-sm text-green-700 dark:text-green-400">Dados salvos com sucesso.</p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (hasExistingData) {
              setConfirmingSave(true);
            } else {
              formRef.current?.requestSubmit();
            }
          }}
          className="rounded-md bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <ConfirmDialog
        open={confirmingSave}
        title="Alterar dados da empresa"
        message="Já existem dados cadastrados. Deseja realmente alterar?"
        confirmLabel="Alterar"
        onConfirm={() => {
          setConfirmingSave(false);
          formRef.current?.requestSubmit();
        }}
        onCancel={() => setConfirmingSave(false)}
      />
    </form>
  );
}
