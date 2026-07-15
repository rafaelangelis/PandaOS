import { requirePermission } from "@/lib/permissions";
import { NewGroupForm } from "./NewGroupForm";

export default async function NovoGrupoPage() {
  await requirePermission("usuarios", "edit");

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 font-sans">
      <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">Novo grupo de permissão</h1>
      <NewGroupForm />
    </div>
  );
}
