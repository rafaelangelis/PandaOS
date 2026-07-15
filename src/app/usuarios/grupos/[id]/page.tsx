import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { EditGroupForm } from "./EditGroupForm";

export default async function EditGroupPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("usuarios", "edit");
  const { id } = await params;

  const group = await prisma.permissionGroup.findUnique({
    where: { id },
    include: { permissions: true },
  });
  if (!group) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 font-sans">
      <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">Editar grupo</h1>
      <EditGroupForm groupId={group.id} name={group.name} permissions={group.permissions} />
    </div>
  );
}
