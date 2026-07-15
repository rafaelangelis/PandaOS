import { MODULES } from "@/lib/modules";

type ModulePermission = { module: string; canView: boolean; canEdit: boolean };

export function GroupPermissionsGrid({
  existing = [],
}: {
  existing?: ModulePermission[];
}) {
  return (
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
            const current = existing.find((p) => p.module === m.key);
            return (
              <tr key={m.key} className="border-t border-black/10 dark:border-white/10">
                <td className="px-4 py-2">{m.label}</td>
                <td className="px-4 py-2">
                  <input type="checkbox" name={`view_${m.key}`} defaultChecked={current?.canView} />
                </td>
                <td className="px-4 py-2">
                  <input type="checkbox" name={`edit_${m.key}`} defaultChecked={current?.canEdit} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
