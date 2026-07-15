import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { NewUserForm } from "./NewUserForm";

export default async function NovoUsuarioPage() {
  await requirePermission("usuarios", "edit");

  const groups = await prisma.permissionGroup.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 font-sans">
      <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">Novo usuário</h1>
      <NewUserForm groups={groups.map((g) => ({ id: g.id, name: g.name }))} />
    </div>
  );
}
