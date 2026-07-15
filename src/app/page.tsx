import Link from "next/link";
import { getCurrentUser, can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const user = await getCurrentUser();

  let lowStockCount = 0;
  if (user && can(user, "estoque", "view")) {
    const parts = await prisma.part.findMany({ select: { quantity: true, minStock: true } });
    lowStockCount = parts.filter((p) => p.quantity <= p.minStock).length;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
          PandaOS
        </h1>
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Bem-vindo, {user?.name}.
        </p>

        {lowStockCount > 0 && (
          <Link
            href="/estoque"
            className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 hover:underline dark:bg-red-950 dark:text-red-400"
          >
            {lowStockCount} {lowStockCount === 1 ? "peça está" : "peças estão"} com estoque baixo
          </Link>
        )}
      </main>
    </div>
  );
}
