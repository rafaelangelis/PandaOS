import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { EditUserForm } from "./EditUserForm";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("usuarios", "edit");
  const { id } = await params;

  const [user, groups] = await Promise.all([
    prisma.user.findUnique({ where: { id }, include: { permissionOverrides: true } }),
    prisma.permissionGroup.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!user) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 font-sans">
      <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">
        Editar usuário — {user.name}
      </h1>
      <EditUserForm
        userId={user.id}
        name={user.name}
        commissionRate={user.commissionRate}
        permissionGroupId={user.permissionGroupId}
        overrides={user.permissionOverrides}
        groups={groups.map((g) => ({ id: g.id, name: g.name }))}
      />
    </div>
  );
}
