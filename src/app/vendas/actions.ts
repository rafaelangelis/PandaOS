"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

export type SaleState = { error?: string };

export async function createSale(
  _prevState: SaleState,
  formData: FormData
): Promise<SaleState> {
  await requirePermission("financeiro", "edit");

  const serviceOrderId = String(formData.get("serviceOrderId") ?? "");
  const paymentMethod = String(formData.get("paymentMethod") ?? "").trim();
  const installmentsCount = Math.max(1, Number(formData.get("installmentsCount") ?? 1) || 1);
  const firstDueDateRaw = String(formData.get("firstDueDate") ?? "");

  if (!serviceOrderId || !paymentMethod || !firstDueDateRaw) {
    return { error: "Preencha forma de pagamento e data do primeiro vencimento." };
  }

  const firstDueDate = new Date(firstDueDateRaw);
  if (Number.isNaN(firstDueDate.getTime())) {
    return { error: "Data de vencimento inválida." };
  }

  const order = await prisma.serviceOrder.findUnique({
    where: { id: serviceOrderId },
    include: { parts: true, services: true, sale: true },
  });

  if (!order) return { error: "Ordem de serviço não encontrada." };
  if (order.sale) return { error: "Esta OS já foi convertida em venda." };

  const totalParts = order.parts.reduce((s, p) => s + p.quantity * p.unitPrice, 0);
  const totalServices = order.services.reduce((s, sv) => s + sv.hours * sv.unitPrice, 0);
  const totalAmount = Math.max(0, totalParts + totalServices - order.discount);

  if (totalAmount <= 0) {
    return { error: "O total da OS precisa ser maior que zero para gerar uma venda." };
  }

  const baseInstallment = Math.floor((totalAmount / installmentsCount) * 100) / 100;
  const installments = Array.from({ length: installmentsCount }, (_, i) => {
    const dueDate = new Date(firstDueDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    const isLast = i === installmentsCount - 1;
    const amount = isLast
      ? Math.round((totalAmount - baseInstallment * (installmentsCount - 1)) * 100) / 100
      : baseInstallment;
    return { number: i + 1, amount, dueDate };
  });

  await prisma.$transaction(async (tx) => {
    const last = await tx.sale.findFirst({ orderBy: { number: "desc" }, select: { number: true } });
    const number = (last?.number ?? 0) + 1;

    const sale = await tx.sale.create({
      data: {
        number,
        serviceOrderId: order.id,
        customerId: order.customerId,
        paymentMethod,
        totalAmount,
        discount: order.discount,
        installments: { create: installments },
      },
    });

    await tx.serviceOrder.update({ where: { id: order.id }, data: { status: "finalizado" } });
  });

  revalidatePath(`/os/${serviceOrderId}`);
  revalidatePath("/financeiro");
  return {};
}

export async function markInstallmentPaid(installmentId: string, accountId: string): Promise<{ error?: string }> {
  if (!accountId) {
    return { error: "Selecione a conta que recebeu o pagamento." };
  }

  await requirePermission("financeiro", "edit");
  await prisma.saleInstallment.update({
    where: { id: installmentId },
    data: { status: "pago", paidAt: new Date(), accountId },
  });
  revalidatePath("/financeiro");
  return {};
}

export async function bulkMarkInstallmentsPaid(ids: string[], accountId: string): Promise<{ error?: string }> {
  if (!ids.length) {
    return { error: "Selecione ao menos uma conta a receber." };
  }
  if (!accountId) {
    return { error: "Selecione a conta que recebeu o pagamento." };
  }

  await requirePermission("financeiro", "edit");

  await prisma.saleInstallment.updateMany({
    where: { id: { in: ids }, status: { not: "pago" } },
    data: { status: "pago", paidAt: new Date(), accountId },
  });

  revalidatePath("/financeiro");
  return {};
}

export async function reverseSale(serviceOrderId: string): Promise<{ error?: string }> {
  await requirePermission("financeiro", "edit");

  const order = await prisma.serviceOrder.findUnique({
    where: { id: serviceOrderId },
    include: { sale: { include: { commission: true } } },
  });

  if (!order?.sale) return { error: "Esta OS não possui venda para estornar." };

  await prisma.$transaction(async (tx) => {
    await tx.saleInstallment.deleteMany({ where: { saleId: order.sale!.id } });
    if (order.sale!.commission) {
      await tx.commission.delete({ where: { id: order.sale!.commission.id } });
    }
    await tx.sale.delete({ where: { id: order.sale!.id } });
    await tx.serviceOrder.update({ where: { id: order.id }, data: { status: "aberta" } });
  });

  revalidatePath(`/os/${serviceOrderId}`);
  revalidatePath("/os");
  revalidatePath("/financeiro");
  return {};
}
