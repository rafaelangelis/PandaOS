"use client";

import { useRouter } from "next/navigation";

export function CancelButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
    >
      Cancelar
    </button>
  );
}
