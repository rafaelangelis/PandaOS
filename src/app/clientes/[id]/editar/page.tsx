import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { EditCustomerForm } from "./EditCustomerForm";

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("clientes", "edit");
  const { id } = await params;

  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 font-sans">
      <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">
        Editar cliente — {customer.name}
      </h1>
      <EditCustomerForm
        customerId={customer.id}
        name={customer.name}
        phone={customer.phone}
        email={customer.email}
        document={customer.document}
        address={customer.address}
        addressNumber={customer.addressNumber}
        neighborhood={customer.neighborhood}
        city={customer.city}
        zipCode={customer.zipCode}
      />
    </div>
  );
}
