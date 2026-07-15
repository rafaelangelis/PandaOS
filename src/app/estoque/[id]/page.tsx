import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { EditPartForm } from "./EditPartForm";

export default async function EditPartPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("estoque", "edit");
  const { id } = await params;

  const part = await prisma.part.findUnique({ where: { id } });
  if (!part) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 font-sans">
      <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">
        Editar peça — {part.name}
      </h1>
      <EditPartForm
        partId={part.id}
        name={part.name}
        sku={part.sku}
        quantity={part.quantity}
        minStock={part.minStock}
        unitPrice={part.unitPrice}
      />
    </div>
  );
}
