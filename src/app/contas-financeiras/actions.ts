"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

export type FinancialAccountFormState = { error?: string };

const VALID_TYPES = ["caixa", "banco", "cartao"];

export async function createFinancialAccount(
  _prevState: FinancialAccountFormState,
  formData: FormData
): Promise<FinancialAccountFormState> {
  await requirePermission("contasFinanceiras", "edit");

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "caixa");
  const initialBalance = Number(formData.get("initialBalance") ?? 0) || 0;

  if (!name) return { error: "Informe o nome da conta." };
  if (!VALID_TYPES.includes(type)) return { error: "Tipo de conta inválido." };

  await prisma.financialAccount.create({
    data: { name, type, initialBalance },
  });

  redirect("/contas-financeiras");
}

export async function updateFinancialAccount(
  accountId: string,
  _prevState: FinancialAccountFormState,
  formData: FormData
): Promise<FinancialAccountFormState> {
  await requirePermission("contasFinanceiras", "edit");

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "caixa");
  const initialBalance = Number(formData.get("initialBalance") ?? 0) || 0;

  if (!name) return { error: "Informe o nome da conta." };
  if (!VALID_TYPES.includes(type)) return { error: "Tipo de conta inválido." };

  await prisma.financialAccount.update({
    where: { id: accountId },
    data: { name, type, initialBalance },
  });

  revalidatePath("/contas-financeiras");
  redirect("/contas-financeiras");
}
