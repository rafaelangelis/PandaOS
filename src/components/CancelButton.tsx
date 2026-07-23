"use client";

import { useRouter } from "next/navigation";

export function CancelButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium text-black hover:bg-black/5 dark:border-transparent dark:bg-white dark:text-black dark:hover:bg-zinc-200"
    >
      Cancelar
    </button>
  );
}
