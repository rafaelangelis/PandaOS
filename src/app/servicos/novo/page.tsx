import { requirePermission } from "@/lib/permissions";
import { NewServiceForm } from "./NewServiceForm";

export default async function NovoServicoPage() {
  await requirePermission("servicos", "edit");

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 font-sans">
      <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">Novo serviço</h1>
      <NewServiceForm />
    </div>
  );
}
