import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { ServiceOrderForm, type ServiceOrderInitialData } from "../../novo/ServiceOrderForm";
import { OSPrintSheet, type OSPrintData } from "@/components/OSPrintSheet";

function formatDateUTC(date: Date) {
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function toInputDate(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

function toInputDateTime(date: Date | null) {
  return date ? date.toISOString().slice(0, 16) : "";
}

export default async function EditarOSPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  await requirePermission("os", "edit");

  const { id } = await params;
  const { from } = await searchParams;

  const [order, customers, technicians, inventoryParts, services] = await Promise.all([
    prisma.serviceOrder.findUnique({
      where: { id },
      include: { customer: true, technician: true, parts: true, services: true },
    }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.part.findMany({ orderBy: { name: "asc" } }),
    prisma.service.findMany({ orderBy: { name: "asc" } }),
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
      hours: s.hours,
      unitPrice: s.unitPrice,
      startedAt: toInputDateTime(s.startedAt),
      endedAt: toInputDateTime(s.endedAt),
    })),
  };

  const printData: OSPrintData = {
    number: order.number,
    status: order.status,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    technicianName: order.technician?.name ?? null,
    entryDateStr: formatDateUTC(order.entryDate),
    equipment: order.equipment,
    serialNumber: order.serialNumber,
    problem: order.problem,
    discount: order.discount,
    parts: order.parts.map((p) => ({ id: p.id, description: p.description, quantity: p.quantity, unitPrice: p.unitPrice })),
    services: order.services.map((s) => ({ id: s.id, description: s.description, hours: s.hours, unitPrice: s.unitPrice })),
  };

  return (
    <>
      <OSPrintSheet data={printData} />
      <div className="mx-auto max-w-5xl px-6 py-10 font-sans print:hidden">
        <ServiceOrderForm
          mode="edit"
          title={`Editar OS #${order.number}`}
          serviceOrderId={order.id}
          returnTo={from}
          initialData={initialData}
          customers={customers.map((c) => ({ id: c.id, name: c.name, phone: c.phone }))}
          technicians={technicians.map((t) => ({ id: t.id, name: t.name }))}
          inventoryParts={inventoryParts.map((p) => ({
            id: p.id,
            name: p.name,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
          }))}
          serviceCatalog={services.map((s) => ({ id: s.id, name: s.name, unitPrice: s.unitPrice }))}
        />
      </div>
    </>
  );
}
