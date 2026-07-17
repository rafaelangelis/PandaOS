import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { EditServiceForm } from "./EditServiceForm";

export default async function EditServicoPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("servicos", "edit");
  const { id } = await params;

  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 font-sans">
      <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">
        Editar serviço — {service.name}
      </h1>
      <EditServiceForm serviceId={service.id} name={service.name} unitPrice={service.unitPrice} />
    </div>
  );
}
