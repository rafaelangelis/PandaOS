"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { bulkMarkInstallmentsPaid } from "@/app/vendas/actions";
import { MarkPaidButton } from "./MarkPaidButton";

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export type InstallmentRow = {
  id: string;
  saleNumber: number;
  serviceOrderId: string;
  customerName: string;
  number: number;
  dueDateStr: string;
  paidAtStr: string | null;
  amount: number;
  status: string;
};

export function ContasReceberTable({
  installments,
  canEdit,
}: {
  installments: InstallmentRow[];
  canEdit: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const allSelected = installments.length > 0 && selected.size === installments.length;
  const selectedTotal = useMemo(
    () => installments.filter((i) => selected.has(i.id)).reduce((s, i) => s + i.amount, 0),
    [installments, selected]
  );

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(installments.map((i) => i.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function applyBaixa() {
    if (selected.size === 0) return;
    setError(null);
    startTransition(async () => {
      const result = await bulkMarkInstallmentsPaid(Array.from(selected));
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSelected(new Set());
    });
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
      <div className="flex-1 overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="text-left text-sm">
          <thead className="bg-black/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
            <tr>
              <th className="whitespace-nowrap px-4 py-2">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Selecionar todas" />
              </th>
              <th className="whitespace-nowrap px-4 py-2">Venda</th>
              <th className="whitespace-nowrap px-4 py-2">Cliente</th>
              <th className="whitespace-nowrap px-4 py-2">Parcela</th>
              <th className="whitespace-nowrap px-4 py-2">Vencimento</th>
              <th className="whitespace-nowrap px-4 py-2">Data da baixa</th>
              <th className="whitespace-nowrap px-4 py-2">Valor</th>
              <th className="whitespace-nowrap px-4 py-2">Status</th>
              {canEdit && <th className="whitespace-nowrap px-4 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {installments.map((inst) => (
              <tr
                key={inst.id}
                className={`border-t border-black/10 dark:border-white/10 ${
                  selected.has(inst.id) ? "bg-black/5 dark:bg-white/10" : ""
                }`}
              >
                <td className="whitespace-nowrap px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(inst.id)}
                    onChange={() => toggleOne(inst.id)}
                    aria-label={`Selecionar parcela ${inst.number} da venda #${inst.saleNumber}`}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-2">
                  <Link href={`/os/${inst.serviceOrderId}`} className="hover:underline">
                    Venda #{inst.saleNumber}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-2">{inst.customerName}</td>
                <td className="whitespace-nowrap px-4 py-2">{inst.number}</td>
                <td className="whitespace-nowrap px-4 py-2">{inst.dueDateStr}</td>
                <td className="whitespace-nowrap px-4 py-2">{inst.paidAtStr ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-2">{currency(inst.amount)}</td>
                <td className="whitespace-nowrap px-4 py-2 capitalize">{inst.status}</td>
                {canEdit && (
                  <td className="whitespace-nowrap px-4 py-2 text-right">
                    {inst.status !== "pago" && <MarkPaidButton installmentId={inst.id} />}
                  </td>
                )}
              </tr>
            ))}
            {installments.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 9 : 8} className="whitespace-nowrap px-4 py-4 text-center text-zinc-500">
                  Nenhuma conta a receber para o filtro selecionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="w-full shrink-0 rounded-lg border border-black/10 p-4 dark:border-white/10 lg:w-64">
        {canEdit && (
          <button
            type="button"
            onClick={applyBaixa}
            disabled={selected.size === 0 || isPending}
            className="w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {isPending ? "Baixando..." : "Baixar selecionados"}
          </button>
        )}
        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className={`flex flex-col gap-1 text-sm ${canEdit ? "mt-4 border-t border-black/10 pt-4 dark:border-white/10" : ""}`}>
          <p className="text-zinc-500">Selecionadas</p>
          <p className="font-medium text-black dark:text-zinc-50">{selected.size}</p>
          <p className="mt-2 text-zinc-500">Valor selecionado</p>
          <p className="font-medium text-black dark:text-zinc-50">{currency(selectedTotal)}</p>
        </div>
      </div>
    </div>
  );
}
