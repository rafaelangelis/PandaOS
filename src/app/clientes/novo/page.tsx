import { requirePermission } from "@/lib/permissions";
import { NewCustomerForm } from "./NewCustomerForm";

export default async function NovoClientePage() {
  await requirePermission("clientes", "edit");

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 font-sans">
      <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">Novo cliente</h1>
      <NewCustomerForm />
    </div>
  );
}
