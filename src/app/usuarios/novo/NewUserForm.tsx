"use client";

import { useActionState } from "react";
import { createUser, type FormState } from "../actions";

const initialState: FormState = {};
const inputClass =
  "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

export function NewUserForm({ groups }: { groups: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createUser, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Nome</label>
        <input type="text" name="name" required className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Usuário (login)</label>
        <input type="text" name="username" required className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Senha</label>
        <input type="password" name="password" required className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Grupo de permissão</label>
        <select name="permissionGroupId" className={inputClass} defaultValue="">
          <option value="">Nenhum</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1 sm:w-48">
        <label className={labelClass}>Comissão (%)</label>
        <input type="number" step="0.01" min={0} name="commissionRate" defaultValue={0} className={inputClass} />
      </div>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {pending ? "Salvando..." : "Criar usuário"}
      </button>
    </form>
  );
}
