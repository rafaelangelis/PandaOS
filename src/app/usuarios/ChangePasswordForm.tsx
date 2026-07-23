"use client";

import { useActionState, useState } from "react";
import { changeUserPassword, type PasswordFormState } from "./actions";

const initialState: PasswordFormState = {};
const inputClass =
  "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

export function ChangePasswordForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const changeUserPasswordWithId = changeUserPassword.bind(null, userId);
  const [state, formAction, pending] = useActionState(changeUserPasswordWithId, initialState);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
      >
        Alterar senha
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 dark:border-white/10">
      <h3 className="text-sm font-semibold text-black dark:text-zinc-50">Alterar senha</h3>
      <form action={formAction} className="flex flex-col gap-3" autoComplete="off">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Nova senha</label>
          <input type="password" name="password" required autoComplete="new-password" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Confirmar nova senha</label>
          <input
            type="password"
            name="confirmPassword"
            required
            autoComplete="new-password"
            className={inputClass}
          />
        </div>

        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
        {state.success && <p className="text-sm text-green-600 dark:text-green-400">Senha alterada com sucesso.</p>}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {pending ? "Salvando..." : "Salvar nova senha"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md border border-black/10 px-4 py-1.5 text-sm font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
