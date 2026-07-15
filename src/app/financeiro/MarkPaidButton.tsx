"use client";

import { useTransition } from "react";
import { markInstallmentPaid } from "@/app/vendas/actions";

export function MarkPaidButton({ installmentId }: { installmentId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => markInstallmentPaid(installmentId))}
      className="text-sm font-medium text-zinc-600 underline hover:text-black disabled:opacity-50 dark:text-zinc-400 dark:hover:text-zinc-50"
    >
      {pending ? "Marcando..." : "Marcar como pago"}
    </button>
  );
}
