"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

export type PartFormState = { error?: string };

export async function createPart(
  _prevState: PartFormState,
  formData: FormData
): Promise<PartFormState> {
  await requirePermission("estoque", "edit");

  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim() || null;
  const quantity = Math.trunc(Number(formData.get("quantity") ?? 0)) || 0;
  const minStock = Math.trunc(Number(formData.get("minStock") ?? 0)) || 0;
  const unitPrice = Number(formData.get("unitPrice") ?? 0) || 0;

  if (!name) return { error: "Informe o nome da peça." };

  await prisma.part.create({
    data: { name, sku, quantity, minStock, unitPrice },
  });

  redirect("/estoque");
}

export async function updatePart(
  partId: string,
  _prevState: PartFormState,
  formData: FormData
): Promise<PartFormState> {
  await requirePermission("estoque", "edit");

  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim() || null;
  const quantity = Math.trunc(Number(formData.get("quantity") ?? 0)) || 0;
  const minStock = Math.trunc(Number(formData.get("minStock") ?? 0)) || 0;
  const unitPrice = Number(formData.get("unitPrice") ?? 0) || 0;

  if (!name) return { error: "Informe o nome da peça." };

  await prisma.part.update({
    where: { id: partId },
    data: { name, sku, quantity, minStock, unitPrice },
  });

  revalidatePath("/estoque");
  redirect("/estoque");
}
