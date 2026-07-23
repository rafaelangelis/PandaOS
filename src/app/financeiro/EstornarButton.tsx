"use client";

import { useState, useTransition } from "react";
import { reverseSale } from "@/app/vendas/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function EstornarButton({ serviceOrderId }: { serviceOrderId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await reverseSale(serviceOrderId);
      if (result?.error) setError(result.error);
      setConfirming(false);
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirming(true)}
        className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {pending ? "Estornando..." : "Estornar"}
      </button>

      <ConfirmDialog
        open={confirming}
        title="Estornar cobrança"
        message="Estornar esta cobrança vai excluir a venda e as parcelas, e reabrir a OS. Deseja continuar?"
        confirmLabel="Estornar"
        danger
        pending={pending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
