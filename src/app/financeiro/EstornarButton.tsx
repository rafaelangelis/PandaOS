"use client";

import { useState, useTransition } from "react";
import { reverseSale } from "@/app/vendas/actions";

export function EstornarButton({ serviceOrderId }: { serviceOrderId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (
      !window.confirm(
        "Estornar esta cobrança vai excluir a venda e as parcelas, e reabrir a OS. Deseja continuar?"
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await reverseSale(serviceOrderId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
      <button
        type="button"
        disabled={pending}
        onClick={handleClick}
        className="text-sm font-medium text-red-600 underline hover:text-red-800 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
      >
        {pending ? "Estornando..." : "Estornar"}
      </button>
    </div>
  );
}
