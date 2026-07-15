"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission, MODULES } from "@/lib/permissions";

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
  const commissionRate = Number(formData.get("commissionRate") ?? 0) || 0;
  const permissionGroupId = String(formData.get("permissionGroupId") ?? "") || null;

  if (!username || !password || !name) {
    return { error: "Preencha usuário, senha e nome." };
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return { error: "Já existe um usuário com esse nome de usuário." };

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { username, password: hashed, name, commissionRate, permissionGroupId },
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
  const commissionRate = Number(formData.get("commissionRate") ?? 0) || 0;
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
    prisma.user.update({ where: { id: userId }, data: { name, commissionRate, permissionGroupId } }),
    ...overrideOps,
  ]);

  redirect("/usuarios");
}
