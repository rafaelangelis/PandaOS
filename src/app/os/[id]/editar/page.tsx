import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { ServiceOrderForm, type ServiceOrderInitialData } from "../../novo/ServiceOrderForm";

function toInputDate(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

function toInputDateTime(date: Date | null) {
  return date ? date.toISOString().slice(0, 16) : "";
}

export default async function EditarOSPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("os", "edit");

  const { id } = await params;

  const [order, customers, technicians, inventoryParts] = await Promise.all([
    prisma.serviceOrder.findUnique({
      where: { id },
      include: { customer: true, technician: true, parts: true, services: true },
    }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.part.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!order) notFound();

  const initialData: ServiceOrderInitialData = {
    customerId: order.customerId,
    customerName: order.customer.name,
    technicianId: order.technicianId ?? "",
    technicianName: order.technician?.name ?? "",
    equipment: order.equipment ?? "",
    serialNumber: order.serialNumber ?? "",
    problem: order.problem ?? "",
    internalNotes: order.internalNotes ?? "",
    entryDate: toInputDate(order.entryDate),
    expectedDate: toInputDate(order.expectedDate),
    completionDate: toInputDate(order.completionDate),
    exitDate: toInputDate(order.exitDate),
    discount: order.discount,
    parts: order.parts.map((p) => ({
      partId: p.partId ?? "",
      description: p.description,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
    })),
    services: order.services.map((s) => ({
      description: s.description,
      unitPrice: s.unitPrice,
      startedAt: toInputDateTime(s.startedAt),
      endedAt: toInputDateTime(s.endedAt),
    })),
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 font-sans">
      <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">
        Editar OS #{order.number}
      </h1>
      <ServiceOrderForm
        mode="edit"
        serviceOrderId={order.id}
        initialData={initialData}
        customers={customers.map((c) => ({ id: c.id, name: c.name, phone: c.phone }))}
        technicians={technicians.map((t) => ({ id: t.id, name: t.name }))}
        inventoryParts={inventoryParts.map((p) => ({
          id: p.id,
          name: p.name,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
        }))}
      />
    </div>
  );
}
