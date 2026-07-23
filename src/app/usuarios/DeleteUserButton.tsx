"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteUser } from "./actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export function DeleteUserButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await deleteUser(userId);
      if (result?.error) {
        setError(result.error);
        setConfirming(false);
        return;
      }
      router.push("/usuarios");
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => setConfirming(true)}
        className="self-start rounded-md border border-red-600 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-600/10 disabled:opacity-50 dark:border-red-400 dark:text-red-400"
      >
        {pending ? "Excluindo..." : "Excluir usuário"}
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <ConfirmDialog
        open={confirming}
        title="Excluir usuário"
        message="Tem certeza que deseja excluir este usuário? Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        danger
        pending={pending}
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
