"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission, MODULES } from "@/lib/permissions";
import { getSession } from "@/lib/auth";

export type FormState = { error?: string };

export async function createGroup(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requirePermission("usuarios", "edit");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Informe o nome do grupo." };

  const group = await prisma.permissionGroup.create({
    data: {
      name,
      permissions: {
        create: MODULES.map((m) => ({
          module: m.key,
          canView: formData.get(`view_${m.key}`) === "on",
          canEdit: formData.get(`edit_${m.key}`) === "on",
        })),
      },
    },
  });

  redirect(`/usuarios/grupos/${group.id}`);
}

export async function updateGroup(
  groupId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requirePermission("usuarios", "edit");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Informe o nome do grupo." };

  await prisma.$transaction([
    prisma.permissionGroup.update({ where: { id: groupId }, data: { name } }),
    ...MODULES.map((m) =>
      prisma.permissionGroupModule.upsert({
        where: { groupId_module: { groupId, module: m.key } },
        create: {
          groupId,
          module: m.key,
          canView: formData.get(`view_${m.key}`) === "on",
          canEdit: formData.get(`edit_${m.key}`) === "on",
        },
        update: {
          canView: formData.get(`view_${m.key}`) === "on",
          canEdit: formData.get(`edit_${m.key}`) === "on",
        },
      })
    ),
  ]);

  revalidatePath(`/usuarios/grupos/${groupId}`);
  redirect("/usuarios");
}

export async function createUser(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requirePermission("usuarios", "edit");

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const permissionGroupId = String(formData.get("permissionGroupId") ?? "") || null;

  if (!username || !password || !name) {
    return { error: "Preencha usuário, senha e nome." };
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return { error: "Já existe um usuário com esse nome de usuário." };

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { username, password: hashed, name, permissionGroupId },
  });

  redirect("/usuarios");
}

export async function updateUser(
  userId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requirePermission("usuarios", "edit");

  const name = String(formData.get("name") ?? "").trim();
  const permissionGroupId = String(formData.get("permissionGroupId") ?? "") || null;

  if (!name) return { error: "Informe o nome." };

  const overrideOps = MODULES.map((m) => {
    const view = String(formData.get(`ov_view_${m.key}`) ?? "inherit");
    const edit = String(formData.get(`ov_edit_${m.key}`) ?? "inherit");
    const canView = view === "inherit" ? null : view === "allow";
    const canEdit = edit === "inherit" ? null : edit === "allow";

    if (canView === null && canEdit === null) {
      return prisma.userPermissionOverride.deleteMany({
        where: { userId, module: m.key },
      });
    }

    return prisma.userPermissionOverride.upsert({
      where: { userId_module: { userId, module: m.key } },
      create: { userId, module: m.key, canView, canEdit },
      update: { canView, canEdit },
    });
  });

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { name, permissionGroupId } }),
    ...overrideOps,
  ]);

  redirect("/usuarios");
}

export type PasswordFormState = { error?: string; success?: boolean };

export async function changeUserPassword(
  userId: string,
  _prevState: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  await requirePermission("usuarios", "edit");

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }
  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem." };
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  return { success: true };
}

export async function deleteUser(userId: string): Promise<{ error?: string }> {
  await requirePermission("usuarios", "edit");

  const session = await getSession();
  if (session?.userId === userId) {
    return { error: "Você não pode excluir seu próprio usuário." };
  }

  const [osCount, commissionCount] = await Promise.all([
    prisma.serviceOrder.count({ where: { technicianId: userId } }),
    prisma.commission.count({ where: { userId } }),
  ]);

  if (osCount > 0) {
    return {
      error: `Não é possível excluir: usuário está vinculado a ${osCount} ${osCount === 1 ? "ordem de serviço" : "ordens de serviço"} como técnico.`,
    };
  }
  if (commissionCount > 0) {
    return { error: "Não é possível excluir: usuário possui comissões registradas." };
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/usuarios");
  return {};
}
