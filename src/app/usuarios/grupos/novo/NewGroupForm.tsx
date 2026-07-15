"use client";

import { useActionState } from "react";
import { createGroup, type FormState } from "../../actions";
import { GroupPermissionsGrid } from "../GroupPermissionsGrid";

const initialState: FormState = {};
const inputClass =
  "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30";

export function NewGroupForm() {
  const [state, formAction, pending] = useActionState(createGroup, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nome do grupo</label>
        <input type="text" name="name" required className={inputClass} placeholder="Ex: Técnicos" />
      </div>

      <GroupPermissionsGrid />

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {pending ? "Salvando..." : "Criar grupo"}
      </button>
    </form>
  );
}
