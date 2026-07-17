"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { bulkUpdateServiceOrderStatus } from "./actions";

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export type OSRow = {
  id: string;
  number: number;
  customerName: string;
  technicianName: string | null;
  status: string;
  entryDateStr: string;
  total: number;
};

export function OSListTable({
  orders,
  canEdit,
  statusOptions,
  grandTotal,
}: {
  orders: OSRow[];
  canEdit: boolean;
  statusOptions: string[];
  grandTotal: number;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState(statusOptions[0] ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const allSelected = orders.length > 0 && selected.size === orders.length;
  const selectedTotal = useMemo(
    () => orders.filter((o) => selected.has(o.id)).reduce((s, o) => s + o.total, 0),
    [orders, selected]
  );

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(orders.map((o) => o.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function applyBulkStatus() {
    if (!bulkStatus.trim() || selected.size === 0) return;
    setError(null);
    startTransition(async () => {
      const result = await bulkUpdateServiceOrderStatus(Array.from(selected), bulkStatus);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSelected(new Set());
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-black/10 bg-black/5 px-4 py-2 text-sm dark:border-white/10 dark:bg-white/5">
          <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black">
            Selecionadas: {selected.size}
          </span>
          <span className="text-zinc-600 dark:text-zinc-400">
            Valor selecionado:{" "}
            <span className="font-medium text-black dark:text-zinc-50">{currency(selectedTotal)}</span>
          </span>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="text-zinc-500 hover:underline dark:text-zinc-400"
          >
            Limpar seleção
          </button>
          {canEdit && (
            <div className="ml-auto flex items-center gap-2">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="rounded-md border border-black/10 bg-transparent px-2 py-1.5 text-sm text-black outline-none dark:border-white/10 dark:text-zinc-50"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={applyBulkStatus}
                disabled={isPending}
                className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                {isPending ? "Aplicando..." : "Mudar status"}
              </button>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
            <tr>
              <th className="w-8 px-4 py-2">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Selecionar todas" />
              </th>
              <th className="px-4 py-2">Nº</th>
              <th className="px-4 py-2">Cliente</th>
              <th className="px-4 py-2">Técnico</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Entrada</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const href = canEdit ? `/os/${order.id}/editar` : `/os/${order.id}`;
              return (
                <tr
                  key={order.id}
                  onClick={() => router.push(href)}
                  className={`cursor-pointer border-t border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5 ${
                    selected.has(order.id) ? "bg-black/5 dark:bg-white/10" : ""
                  }`}
                >
                  <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(order.id)}
                      onChange={() => toggleOne(order.id)}
                      aria-label={`Selecionar OS #${order.number}`}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      href={href}
                      onClick={(e) => e.stopPropagation()}
                      className="font-medium text-black hover:underline dark:text-zinc-50"
                    >
                      #{order.number}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{order.customerName}</td>
                  <td className="px-4 py-2">{order.technicianName ?? "—"}</td>
                  <td className="px-4 py-2 capitalize">{order.status}</td>
                  <td className="px-4 py-2">{order.entryDateStr}</td>
                  <td className="px-4 py-2 text-right">{currency(order.total)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5">
              <td colSpan={6} className="px-4 py-2 text-right font-medium text-black dark:text-zinc-50">
                Total do período
              </td>
              <td className="px-4 py-2 text-right font-semibold text-black dark:text-zinc-50">
                {currency(grandTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
