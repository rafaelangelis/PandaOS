import Link from "next/link";

export default function SemPermissaoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">Acesso negado</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Você não tem permissão para acessar esta área.
      </p>
      <Link href="/" className="text-sm text-zinc-500 underline">
        Voltar para o início
      </Link>
    </div>
  );
}
