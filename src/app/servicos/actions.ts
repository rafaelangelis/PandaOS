"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

export type ServiceFormState = { error?: string };

export async function createService(
  _prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  await requirePermission("servicos", "edit");

  const name = String(formData.get("name") ?? "").trim();
  const unitPrice = Number(formData.get("unitPrice") ?? 0) || 0;

  if (!name) return { error: "Informe o nome do serviço." };

  await prisma.service.create({
    data: { name, unitPrice },
  });

  redirect("/servicos");
}

export async function updateService(
  serviceId: string,
  _prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  await requirePermission("servicos", "edit");

  const name = String(formData.get("name") ?? "").trim();
  const unitPrice = Number(formData.get("unitPrice") ?? 0) || 0;

  if (!name) return { error: "Informe o nome do serviço." };

  await prisma.service.update({
    where: { id: serviceId },
    data: { name, unitPrice },
  });

  revalidatePath("/servicos");
  redirect("/servicos");
}
