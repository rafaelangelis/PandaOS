"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

export type CustomerFormState = { error?: string };

export async function createCustomer(
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  await requirePermission("clientes", "edit");

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const document = String(formData.get("document") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const addressNumber = String(formData.get("addressNumber") ?? "").trim() || null;
  const neighborhood = String(formData.get("neighborhood") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;
  const zipCode = String(formData.get("zipCode") ?? "").trim() || null;

  if (!name) return { error: "Informe o nome do cliente." };

  const customer = await prisma.customer.create({
    data: { name, phone, email, document, address, addressNumber, neighborhood, city, zipCode },
  });

  redirect(`/clientes/${customer.id}`);
}

export async function updateCustomer(
  customerId: string,
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  await requirePermission("clientes", "edit");

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const document = String(formData.get("document") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim() || null;
  const addressNumber = String(formData.get("addressNumber") ?? "").trim() || null;
  const neighborhood = String(formData.get("neighborhood") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;
  const zipCode = String(formData.get("zipCode") ?? "").trim() || null;

  if (!name) return { error: "Informe o nome do cliente." };

  await prisma.customer.update({
    where: { id: customerId },
    data: { name, phone, email, document, address, addressNumber, neighborhood, city, zipCode },
  });

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${customerId}`);
  redirect("/clientes");
}
