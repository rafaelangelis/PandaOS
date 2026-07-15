import { requirePermission } from "@/lib/permissions";
import { NewPartForm } from "./NewPartForm";

export default async function NovaPecaPage() {
  await requirePermission("estoque", "edit");

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 font-sans">
      <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">Nova peça</h1>
      <NewPartForm />
    </div>
  );
}
