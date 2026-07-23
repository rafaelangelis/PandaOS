"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { bulkMarkInstallmentsPaid, partialMarkInstallmentPaid, discountMarkInstallmentPaid } from "@/app/vendas/actions";
import { EstornarButton } from "./EstornarButton";

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
  accountName: string | null;
};

export type FinancialAccountOption = { id: string; name: string };

export function ContasReceberTable({
  installments,
  accounts,
  canEdit,
}: {
  installments: InstallmentRow[];
  accounts: FinancialAccountOption[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [accountId, setAccountId] = useState("");
  const [baixaType, setBaixaType] = useState<"total" | "parcial" | "desconto">("total");
  const [partialAmount, setPartialAmount] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const selectableInstallments = useMemo(() => installments.filter((i) => i.status !== "pago"), [installments]);
  const allSelected = selectableInstallments.length > 0 && selected.size === selectableInstallments.length;
  const selectedTotal = useMemo(
    () => installments.filter((i) => selected.has(i.id)).reduce((s, i) => s + i.amount, 0),
    [installments, selected]
  );
  const singleSelected = selected.size === 1 ? installments.find((i) => selected.has(i.id)) ?? null : null;

  useEffect(() => {
    if (selected.size !== 1) setBaixaType("total");
  }, [selected.size]);

  // Keep the selection in sync with the current rows: if an installment gets
  // removed from the list from under us (e.g. Estornar deletes it), drop its
  // id from `selected` too, or it keeps counting toward the selection size
  // and silently blocks "Parcial" (which requires exactly one real row).
  useEffect(() => {
    setSelected((prev) => {
      const validIds = new Set(installments.map((i) => i.id));
      const next = new Set(Array.from(prev).filter((id) => validIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [installments]);

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(selectableInstallments.map((i) => i.id)));
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

    if (baixaType === "parcial") {
      if (!singleSelected) return;
      const amount = Number(partialAmount);
      startTransition(async () => {
        const result = await partialMarkInstallmentPaid(singleSelected.id, accountId, amount);
        if (result?.error) {
          setError(result.error);
          return;
        }
        setSelected(new Set());
        setPartialAmount("");
      });
      return;
    }

    if (baixaType === "desconto") {
      if (!singleSelected) return;
      const discount = Number(discountAmount);
      startTransition(async () => {
        const result = await discountMarkInstallmentPaid(singleSelected.id, accountId, discount);
        if (result?.error) {
          setError(result.error);
          return;
        }
        setSelected(new Set());
        setDiscountAmount("");
      });
      return;
    }

    startTransition(async () => {
      const result = await bulkMarkInstallmentsPaid(Array.from(selected), accountId);
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
              <th className="whitespace-nowrap px-4 py-2">Conta</th>
              <th className="whitespace-nowrap px-4 py-2">Valor</th>
              <th className="whitespace-nowrap px-4 py-2">Status</th>
              {canEdit && <th className="whitespace-nowrap px-4 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {installments.map((inst) => (
              <tr
                key={inst.id}
                onClick={() => router.push(`/os/${inst.serviceOrderId}?from=financeiro`)}
                className={`cursor-pointer border-t border-black/10 hover:bg-orange-100 dark:border-white/10 dark:hover:bg-[rgba(255,165,0,0.18)] ${
                  selected.has(inst.id) ? "bg-black/5 dark:bg-white/10" : ""
                }`}
              >
                <td className="whitespace-nowrap px-4 py-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(inst.id)}
                    onChange={() => toggleOne(inst.id)}
                    disabled={inst.status === "pago"}
                    aria-label={`Selecionar parcela ${inst.number} da venda #${inst.saleNumber}`}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-2">
                  <Link href={`/os/${inst.serviceOrderId}?from=financeiro`} onClick={(e) => e.stopPropagation()}>
                    Venda #{inst.saleNumber}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-2">{inst.customerName}</td>
                <td className="whitespace-nowrap px-4 py-2">{inst.number}</td>
                <td className="whitespace-nowrap px-4 py-2">{inst.dueDateStr}</td>
                <td className="whitespace-nowrap px-4 py-2">{inst.paidAtStr ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-2">{inst.accountName ?? "—"}</td>
                <td className="whitespace-nowrap px-4 py-2">{currency(inst.amount)}</td>
                <td className="whitespace-nowrap px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      inst.status === "pago"
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                        : inst.status === "parcial"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400"
                          : inst.status === "pendente"
                            ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                            : "bg-black/5 text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
                    }`}
                  >
                    {inst.status}
                  </span>
                </td>
                {canEdit && (
                  <td className="whitespace-nowrap px-4 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                    <EstornarButton serviceOrderId={inst.serviceOrderId} />
                  </td>
                )}
              </tr>
            ))}
            {installments.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 10 : 9} className="whitespace-nowrap px-4 py-4 text-center text-zinc-500">
                  Nenhuma conta a receber para o filtro selecionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="w-full shrink-0 rounded-lg border border-black/10 p-4 dark:border-white/10 lg:w-64">
        {canEdit && (
          <>
            <label className="mb-1 block text-xs font-medium text-zinc-500">Conta financeira</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="mb-3 w-full rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30"
            >
              <option value="">Selecione...</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            <label className="mb-1 block text-xs font-medium text-zinc-500">Tipo de baixa</label>
            <div className="mb-3 flex gap-3 text-sm">
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="baixaType"
                  checked={baixaType === "total"}
                  onChange={() => setBaixaType("total")}
                />
                Total
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="baixaType"
                  checked={baixaType === "parcial"}
                  disabled={!singleSelected}
                  onChange={() => setBaixaType("parcial")}
                />
                Parcial
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name="baixaType"
                  checked={baixaType === "desconto"}
                  disabled={!singleSelected}
                  onChange={() => setBaixaType("desconto")}
                />
                Desconto
              </label>
            </div>
            {!singleSelected && (
              <p className="mb-3 text-xs text-zinc-500">
                Baixa parcial ou com desconto só está disponível com uma parcela selecionada.
              </p>
            )}

            {baixaType === "parcial" && singleSelected && (
              <div className="mb-3 flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-500">
                  Valor pago (parcela: {currency(singleSelected.amount)})
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  data-numeric="decimal"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  className="w-full rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30"
                />
              </div>
            )}

            {baixaType === "desconto" && singleSelected && (
              <div className="mb-3 flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-500">
                  Valor do desconto (parcela: {currency(singleSelected.amount)})
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  data-numeric="decimal"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-full rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30"
                />
                {Number(discountAmount) > 0 && (
                  <p className="text-xs text-zinc-500">
                    Valor a receber: {currency(Math.max(0, singleSelected.amount - Number(discountAmount)))}
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={applyBaixa}
              disabled={selected.size === 0 || isPending}
              className="w-full rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending ? "Baixando..." : "Baixar selecionados"}
            </button>
          </>
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
