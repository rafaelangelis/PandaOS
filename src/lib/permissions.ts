import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { MODULES, type ModuleKey } from "@/lib/modules";

export { MODULES };
export type { ModuleKey };

export type CurrentUser = {
  id: string;
  name: string;
  username: string;
  isAdmin: boolean;
  permissions: Record<string, { canView: boolean; canEdit: boolean }>;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      permissionGroup: { include: { permissions: true } },
      permissionOverrides: true,
    },
  });
  if (!user) return null;

  const permissions: CurrentUser["permissions"] = {};
  for (const mod of MODULES) {
    const fromGroup = user.permissionGroup?.permissions.find((p) => p.module === mod.key);
    const override = user.permissionOverrides.find((o) => o.module === mod.key);
    permissions[mod.key] = {
      canView: override?.canView ?? fromGroup?.canView ?? false,
      canEdit: override?.canEdit ?? fromGroup?.canEdit ?? false,
    };
  }

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    isAdmin: user.isAdmin,
    permissions,
  };
}

export function can(
  user: CurrentUser,
  module: ModuleKey,
  action: "view" | "edit"
): boolean {
  if (user.isAdmin) return true;
  const perm = user.permissions[module];
  if (!perm) return false;
  return action === "view" ? perm.canView || perm.canEdit : perm.canEdit;
}

export async function requirePermission(
  module: ModuleKey,
  action: "view" | "edit"
): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!can(user, module, action)) redirect("/sem-permissao");
  return user;
}
