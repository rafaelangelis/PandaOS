import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { ServiceOrderForm } from "./ServiceOrderForm";

export default async function NovaOSPage() {
  await requirePermission("os", "edit");

  const [customers, technicians, parts, services] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.part.findMany({ orderBy: { name: "asc" } }),
    prisma.service.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 font-sans">
      <ServiceOrderForm
        title="Nova Ordem de Serviço"
        customers={customers.map((c) => ({ id: c.id, name: c.name, phone: c.phone }))}
        technicians={technicians.map((t) => ({ id: t.id, name: t.name }))}
        inventoryParts={parts.map((p) => ({
          id: p.id,
          name: p.name,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
        }))}
        serviceCatalog={services.map((s) => ({ id: s.id, name: s.name, unitPrice: s.unitPrice }))}
      />
    </div>
  );
}
