import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { EmpresaForm } from "./EmpresaForm";

export default async function EmpresaPage() {
  await requirePermission("empresa", "view");

  const company = await prisma.companyInfo.findUnique({ where: { id: "singleton" } });

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 font-sans">
      <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">Dados da Empresa</h1>
      <EmpresaForm
        name={company?.name ?? null}
        legalName={company?.legalName ?? null}
        cnpj={company?.cnpj ?? null}
        address={company?.address ?? null}
        addressNumber={company?.addressNumber ?? null}
        neighborhood={company?.neighborhood ?? null}
        zipCode={company?.zipCode ?? null}
        city={company?.city ?? null}
        phone={company?.phone ?? null}
        logoUrl={company?.logoUrl ?? null}
        hasExistingData={company !== null}
      />
    </div>
  );
}
