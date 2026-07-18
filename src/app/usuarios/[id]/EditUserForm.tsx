"use client";

import { useActionState } from "react";
import { updateUser, type FormState } from "../actions";
import { MODULES } from "@/lib/modules";
import { CancelButton } from "@/components/CancelButton";

const initialState: FormState = {};
const inputClass =
  "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

type Override = { module: string; canView: boolean | null; canEdit: boolean | null };

function overrideValue(v: boolean | null | undefined) {
  if (v === true) return "allow";
  if (v === false) return "deny";
  return "inherit";
}

export function EditUserForm({
  userId,
  name,
  permissionGroupId,
  overrides,
  groups,
}: {
  userId: string;
  name: string;
  permissionGroupId: string | null;
  overrides: Override[];
  groups: { id: string; name: string }[];
}) {
  const updateUserWithId = updateUser.bind(null, userId);
  const [state, formAction, pending] = useActionState(updateUserWithId, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Nome</label>
        <input type="text" name="name" required defaultValue={name} className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className={labelClass}>Grupo de permissão</label>
        <select name="permissionGroupId" className={inputClass} defaultValue={permissionGroupId ?? ""}>
          <option value="">Nenhum</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-black dark:text-zinc-50">
          Permissões individuais (sobrepõem o grupo)
        </h2>
        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
              <tr>
                <th className="px-4 py-2">Módulo</th>
                <th className="px-4 py-2">Visualizar</th>
                <th className="px-4 py-2">Editar</th>
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m) => {
                const current = overrides.find((o) => o.module === m.key);
                return (
                  <tr key={m.key} className="border-t border-black/10 dark:border-white/10">
                    <td className="px-4 py-2">{m.label}</td>
                    <td className="px-4 py-2">
                      <select
                        name={`ov_view_${m.key}`}
                        defaultValue={overrideValue(current?.canView)}
                        className={inputClass}
                      >
                        <option value="inherit">Herdar do grupo</option>
                        <option value="allow">Permitir</option>
                        <option value="deny">Negar</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select
                        name={`ov_edit_${m.key}`}
                        defaultValue={overrideValue(current?.canEdit)}
                        className={inputClass}
                      >
                        <option value="inherit">Herdar do grupo</option>
                        <option value="allow">Permitir</option>
                        <option value="deny">Negar</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
