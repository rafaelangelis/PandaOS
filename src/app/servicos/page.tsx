import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission, can } from "@/lib/permissions";
import { ServicosTable } from "./ServicosTable";

export default async function ServicosPage() {
  const user = await requirePermission("servicos", "view");
  const canEdit = can(user, "servicos", "edit");

  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 font-sans">
      <Link href="/" className="mb-6 inline-block text-sm text-zinc-500 hover:underline">
        ← Voltar
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Serviços</h1>
        {canEdit && (
          <Link
            href="/servicos/novo"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            + Novo serviço
          </Link>
        )}
      </div>

      <ServicosTable services={services} canEdit={canEdit} />
    </div>
  );
}
