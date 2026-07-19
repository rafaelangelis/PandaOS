"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

export type ServiceOrderState = {
  error?: string;
};

type PartInput = {
  partId: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

type ServiceInput = {
  description: string;
  hours: number;
  unitPrice: number;
  startedAt: string | null;
  endedAt: string | null;
};

function toDate(value: FormDataEntryValue | null): Date | null {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function searchCustomers(query: string) {
  if (!query.trim()) return [];
  return prisma.customer.findMany({
    where: { name: { contains: query } },
    orderBy: { name: "asc" },
    take: 10,
  });
}

export async function createServiceOrder(
  _prevState: ServiceOrderState,
  formData: FormData
): Promise<ServiceOrderState> {
  await requirePermission("os", "edit");

  const customerId = String(formData.get("customerId") ?? "");
  const newCustomerName = String(formData.get("newCustomerName") ?? "").trim();
  const newCustomerPhone = String(formData.get("newCustomerPhone") ?? "").trim();

  if (!customerId && !newCustomerName) {
    return { error: "Selecione um cliente ou cadastre um novo." };
  }

  const technicianId = String(formData.get("technicianId") ?? "") || null;
  const equipment = String(formData.get("equipment") ?? "").trim() || null;
  const serialNumber = String(formData.get("serialNumber") ?? "").trim() || null;
  const problem = String(formData.get("problem") ?? "").trim() || null;
  const internalNotes = String(formData.get("internalNotes") ?? "").trim() || null;
  const discount = Number(formData.get("discount") ?? 0) || 0;

  const entryDate = toDate(formData.get("entryDate")) ?? new Date();
  const expectedDate = toDate(formData.get("expectedDate"));
  const completionDate = toDate(formData.get("completionDate"));
  const exitDate = toDate(formData.get("exitDate"));

  let parts: PartInput[] = [];
  let services: ServiceInput[] = [];

  try {
    parts = JSON.parse(String(formData.get("partsJson") ?? "[]"));
    services = JSON.parse(String(formData.get("servicesJson") ?? "[]"));
  } catch {
    return { error: "Dados de peças ou serviços inválidos." };
  }

  parts = parts.filter((p) => p.description.trim() !== "");
  services = services.filter((s) => s.description.trim() !== "");

  const serviceOrder = await prisma.$transaction(async (tx) => {
    let finalCustomerId = customerId;

    if (!finalCustomerId && newCustomerName) {
      const customer = await tx.customer.create({
        data: { name: newCustomerName, phone: newCustomerPhone || null },
      });
      finalCustomerId = customer.id;
    }

    const last = await tx.serviceOrder.findFirst({
      orderBy: { number: "desc" },
      select: { number: true },
    });
    const number = (last?.number ?? 0) + 1;

    const order = await tx.serviceOrder.create({
      data: {
        number,
        customerId: finalCustomerId,
        technicianId,
        equipment,
        serialNumber,
        problem,
        internalNotes,
        discount,
        entryDate,
        expectedDate,
        completionDate,
        exitDate,
        parts: {
          create: parts.map((p) => ({
            partId: p.partId || null,
            description: p.description,
            quantity: p.quantity || 1,
            unitPrice: p.unitPrice || 0,
          })),
        },
        services: {
          create: services.map((s) => ({
            description: s.description,
            hours: s.hours || 1,
            unitPrice: s.unitPrice || 0,
            startedAt: s.startedAt ? new Date(s.startedAt) : null,
            endedAt: s.endedAt ? new Date(s.endedAt) : null,
          })),
        },
      },
    });

    for (const p of parts) {
      if (!p.partId) continue;
      await tx.part.update({
        where: { id: p.partId },
        data: { quantity: { decrement: p.quantity || 1 } },
      });
    }

    return order;
  });

  redirect("/os");
}

export async function updateServiceOrder(
  _prevState: ServiceOrderState,
  formData: FormData
): Promise<ServiceOrderState> {
  await requirePermission("os", "edit");

  const serviceOrderId = String(formData.get("serviceOrderId") ?? "");
  if (!serviceOrderId) return { error: "Ordem de serviço inválida." };

  const existing = await prisma.serviceOrder.findUnique({
    where: { id: serviceOrderId },
    include: { parts: true },
  });
  if (!existing) return { error: "Ordem de serviço não encontrada." };

  const customerId = String(formData.get("customerId") ?? "");
  const newCustomerName = String(formData.get("newCustomerName") ?? "").trim();
  const newCustomerPhone = String(formData.get("newCustomerPhone") ?? "").trim();

  if (!customerId && !newCustomerName) {
    return { error: "Selecione um cliente ou cadastre um novo." };
  }

  const technicianId = String(formData.get("technicianId") ?? "") || null;
  const equipment = String(formData.get("equipment") ?? "").trim() || null;
  const serialNumber = String(formData.get("serialNumber") ?? "").trim() || null;
  const problem = String(formData.get("problem") ?? "").trim() || null;
  const internalNotes = String(formData.get("internalNotes") ?? "").trim() || null;
  const discount = Number(formData.get("discount") ?? 0) || 0;

  const entryDate = toDate(formData.get("entryDate")) ?? existing.entryDate;
  const expectedDate = toDate(formData.get("expectedDate"));
  const completionDate = toDate(formData.get("completionDate"));
  const exitDate = toDate(formData.get("exitDate"));

  let parts: PartInput[] = [];
  let services: ServiceInput[] = [];

  try {
    parts = JSON.parse(String(formData.get("partsJson") ?? "[]"));
    services = JSON.parse(String(formData.get("servicesJson") ?? "[]"));
  } catch {
    return { error: "Dados de peças ou serviços inválidos." };
  }

  parts = parts.filter((p) => p.description.trim() !== "");
  services = services.filter((s) => s.description.trim() !== "");

  await prisma.$transaction(async (tx) => {
    let finalCustomerId = customerId;

    if (!finalCustomerId && newCustomerName) {
      const customer = await tx.customer.create({
        data: { name: newCustomerName, phone: newCustomerPhone || null },
      });
      finalCustomerId = customer.id;
    }

    // Restore stock consumed by the previous version of this OS before applying the new part list.
    for (const p of existing.parts) {
      if (!p.partId) continue;
      await tx.part.update({
        where: { id: p.partId },
        data: { quantity: { increment: p.quantity } },
      });
    }

    await tx.serviceOrder.update({
      where: { id: serviceOrderId },
      data: {
        customerId: finalCustomerId,
        technicianId,
        equipment,
        serialNumber,
        problem,
        internalNotes,
        discount,
        entryDate,
        expectedDate,
        completionDate,
        exitDate,
        parts: {
          deleteMany: {},
          create: parts.map((p) => ({
            partId: p.partId || null,
            description: p.description,
            quantity: p.quantity || 1,
            unitPrice: p.unitPrice || 0,
          })),
        },
        services: {
          deleteMany: {},
          create: services.map((s) => ({
            description: s.description,
            hours: s.hours || 1,
            unitPrice: s.unitPrice || 0,
            startedAt: s.startedAt ? new Date(s.startedAt) : null,
            endedAt: s.endedAt ? new Date(s.endedAt) : null,
          })),
        },
      },
    });

    for (const p of parts) {
      if (!p.partId) continue;
      await tx.part.update({
        where: { id: p.partId },
        data: { quantity: { decrement: p.quantity || 1 } },
      });
    }
  });

  const returnTo = String(formData.get("returnTo") ?? "");
  redirect(returnTo === "financeiro" ? "/financeiro?status=pendente&q=1" : "/os");
}

export async function bulkUpdateServiceOrderStatus(
  ids: string[],
  status: string
): Promise<{ error?: string }> {
  const trimmed = status.trim();
  if (!ids.length || !trimmed) {
    return { error: "Selecione ao menos uma OS e um status." };
  }

  await requirePermission("os", "edit");

  if (trimmed === "finalizado") {
    // Finalizar uma OS launches it into Contas a Receber automatically (unless it
    // already has a Sale, e.g. from "Converter em Venda") — 1 installment due in
    // 30 days, payment method "A definir" (decided via AskUserQuestion, 2026-07-16).
    await requirePermission("financeiro", "edit");

    const orders = await prisma.serviceOrder.findMany({
      where: { id: { in: ids }, sale: null },
      include: { parts: true, services: true },
    });

    for (const order of orders) {
      const totalParts = order.parts.reduce((s, p) => s + p.quantity * p.unitPrice, 0);
      const totalServices = order.services.reduce((s, sv) => s + sv.hours * sv.unitPrice, 0);
      const totalAmount = Math.max(0, totalParts + totalServices - order.discount);

      if (totalAmount <= 0) continue;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const last = await prisma.sale.findFirst({ orderBy: { number: "desc" }, select: { number: true } });
      const number = (last?.number ?? 0) + 1;

      await prisma.sale.create({
        data: {
          number,
          serviceOrderId: order.id,
          customerId: order.customerId,
          paymentMethod: "A definir",
          totalAmount,
          discount: order.discount,
          installments: { create: [{ number: 1, amount: totalAmount, dueDate }] },
        },
      });
    }
  }

  await prisma.serviceOrder.updateMany({
    where: { id: { in: ids } },
    data: { status: trimmed },
  });

  revalidatePath("/os");
  revalidatePath("/financeiro");
  return {};
}
