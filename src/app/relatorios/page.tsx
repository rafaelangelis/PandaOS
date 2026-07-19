import { requirePermission } from "@/lib/permissions";

export default async function RelatoriosPage() {
  await requirePermission("relatorios", "view");

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 font-sans">
      <h1 className="mb-4 text-2xl font-semibold text-black dark:text-zinc-50">Relatórios</h1>
      <p className="text-sm text-zinc-500">Em breve.</p>
    </div>
  );
}
