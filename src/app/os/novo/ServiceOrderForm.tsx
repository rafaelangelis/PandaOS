"use client";

import { useActionState, useMemo, useState } from "react";
import { createServiceOrder, updateServiceOrder, type ServiceOrderState } from "../actions";

type Customer = { id: string; name: string; phone: string | null };
type Technician = { id: string; name: string };
type InventoryPart = { id: string; name: string; quantity: number; unitPrice: number };

type PartRow = {
  key: string;
  partId: string;
  description: string;
  quantity: number;
  unitPrice: number;
};
type ServiceRow = {
  key: string;
  description: string;
  unitPrice: number;
  startedAt: string;
  endedAt: string;
};

export type ServiceOrderInitialData = {
  customerId: string;
  customerName: string;
  technicianId: string;
  technicianName: string;
  equipment: string;
  serialNumber: string;
  problem: string;
  internalNotes: string;
  entryDate: string;
  expectedDate: string;
  completionDate: string;
  exitDate: string;
  discount: number;
  parts: Omit<PartRow, "key">[];
  services: Omit<ServiceRow, "key">[];
};

const initialState: ServiceOrderState = {};

const inputClass =
  "rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30";
const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function todayLocalDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function nowLocalDateTime() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 16);
}

export function ServiceOrderForm({
  customers,
  technicians,
  inventoryParts,
  mode = "create",
  serviceOrderId,
  initialData,
}: {
  customers: Customer[];
  technicians: Technician[];
  inventoryParts: InventoryPart[];
  mode?: "create" | "edit";
  serviceOrderId?: string;
  initialData?: ServiceOrderInitialData;
}) {
  const [state, formAction, pending] = useActionState(
    mode === "edit" ? updateServiceOrder : createServiceOrder,
    initialState
  );

  const [customerQuery, setCustomerQuery] = useState(initialData?.customerName ?? "");
  const [customerId, setCustomerId] = useState(initialData?.customerId ?? "");
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [customerHighlight, setCustomerHighlight] = useState(-1);
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!customerQuery.trim()) return [];
    const q = customerQuery.toLowerCase();
    return customers.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8);
  }, [customers, customerQuery]);

  function selectCustomer(c: Customer) {
    setCustomerId(c.id);
    setCustomerQuery(c.name);
    setShowCustomerList(false);
    setCustomerHighlight(-1);
  }

  const [technicianQuery, setTechnicianQuery] = useState(initialData?.technicianName ?? "");
  const [technicianId, setTechnicianId] = useState(initialData?.technicianId ?? "");
  const [showTechnicianList, setShowTechnicianList] = useState(false);
  const [technicianHighlight, setTechnicianHighlight] = useState(-1);

  const filteredTechnicians = useMemo(() => {
    if (!technicianQuery.trim()) return [];
    const q = technicianQuery.toLowerCase();
    return technicians.filter((t) => t.name.toLowerCase().includes(q)).slice(0, 8);
  }, [technicians, technicianQuery]);

  function selectTechnician(t: Technician) {
    setTechnicianId(t.id);
    setTechnicianQuery(t.name);
    setShowTechnicianList(false);
    setTechnicianHighlight(-1);
  }

  const [parts, setParts] = useState<PartRow[]>(
    initialData?.parts.length
      ? initialData.parts.map((p) => ({ ...p, key: crypto.randomUUID() }))
      : [{ key: crypto.randomUUID(), partId: "", description: "", quantity: 1, unitPrice: 0 }]
  );
  const [openPartDropdown, setOpenPartDropdown] = useState<string | null>(null);
  const [partHighlight, setPartHighlight] = useState(-1);
  const [services, setServices] = useState<ServiceRow[]>(
    initialData?.services.length
      ? initialData.services.map((s) => ({ ...s, key: crypto.randomUUID() }))
      : [{ key: crypto.randomUUID(), description: "", unitPrice: 0, startedAt: "", endedAt: "" }]
  );

  const totalParts = parts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
  const totalServices = services.reduce((sum, s) => sum + s.unitPrice, 0);
  const [discount, setDiscount] = useState(initialData?.discount ?? 0);
  const total = Math.max(0, totalParts + totalServices - discount);

  return (
    <form action={formAction} className="flex flex-col gap-8" autoComplete="off">
      <section className="flex flex-col gap-4 rounded-lg border border-black/10 p-6 dark:border-white/10">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative flex flex-col gap-1">
            <label className={labelClass}>Cliente *</label>
            {!creatingCustomer ? (
              <>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Digite o nome do cliente"
                  value={customerQuery}
                  autoComplete="off"
                  onChange={(e) => {
                    setCustomerQuery(e.target.value);
                    setCustomerId("");
                    setShowCustomerList(true);
                    setCustomerHighlight(-1);
                  }}
                  onFocus={() => setShowCustomerList(true)}
                  onBlur={() => setTimeout(() => setShowCustomerList(false), 150)}
                  onKeyDown={(e) => {
                    if (!showCustomerList || filteredCustomers.length === 0) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setCustomerHighlight((i) => (i + 1) % filteredCustomers.length);
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setCustomerHighlight((i) => (i <= 0 ? filteredCustomers.length - 1 : i - 1));
                    } else if (e.key === "Enter" && customerHighlight >= 0) {
                      e.preventDefault();
                      selectCustomer(filteredCustomers[customerHighlight]);
                    } else if (e.key === "Escape") {
                      setShowCustomerList(false);
                      setCustomerHighlight(-1);
                    }
                  }}
                />
                {showCustomerList && filteredCustomers.length > 0 && (
                  <ul className="absolute top-full z-10 mt-1 w-full rounded-md border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-zinc-950">
                    {filteredCustomers.map((c, idx) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          className={`block w-full px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 ${
                            idx === customerHighlight ? "bg-black/5 dark:bg-white/10" : ""
                          }`}
                          onMouseEnter={() => setCustomerHighlight(idx)}
                          onClick={() => selectCustomer(c)}
                        >
                          {c.name}
                          {c.phone ? ` — ${c.phone}` : ""}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <input type="hidden" name="customerId" value={customerId} />
                <button
                  type="button"
                  className="mt-1 self-start text-xs font-medium text-zinc-600 underline dark:text-zinc-400"
                  onClick={() => {
                    setCreatingCustomer(true);
                    setCustomerId("");
                    setCustomerQuery("");
                  }}
                >
                  + Novo cliente
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  name="newCustomerName"
                  required
                  placeholder="Nome do cliente"
                  className={inputClass}
                  autoComplete="off"
                />
                <input
                  type="text"
                  name="newCustomerPhone"
                  placeholder="Telefone (opcional)"
                  className={inputClass}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="self-start text-xs font-medium text-zinc-600 underline dark:text-zinc-400"
                  onClick={() => setCreatingCustomer(false)}
                >
                  Selecionar cliente existente
                </button>
              </div>
            )}
          </div>

          <div className="relative flex flex-col gap-1">
            <label className={labelClass}>Técnico</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Digite o nome do técnico"
              value={technicianQuery}
              autoComplete="off"
              onChange={(e) => {
                setTechnicianQuery(e.target.value);
                setTechnicianId("");
                setShowTechnicianList(true);
                setTechnicianHighlight(-1);
              }}
              onFocus={() => setShowTechnicianList(true)}
              onBlur={() => setTimeout(() => setShowTechnicianList(false), 150)}
              onKeyDown={(e) => {
                if (!showTechnicianList || filteredTechnicians.length === 0) return;
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setTechnicianHighlight((i) => (i + 1) % filteredTechnicians.length);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setTechnicianHighlight((i) => (i <= 0 ? filteredTechnicians.length - 1 : i - 1));
                } else if (e.key === "Enter" && technicianHighlight >= 0) {
                  e.preventDefault();
                  selectTechnician(filteredTechnicians[technicianHighlight]);
                } else if (e.key === "Escape") {
                  setShowTechnicianList(false);
                  setTechnicianHighlight(-1);
                }
              }}
            />
            {showTechnicianList && filteredTechnicians.length > 0 && (
              <ul className="absolute top-full z-10 mt-1 w-full rounded-md border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-zinc-950">
                {filteredTechnicians.map((t, idx) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      className={`block w-full px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 ${
                        idx === technicianHighlight ? "bg-black/5 dark:bg-white/10" : ""
                      }`}
                      onMouseEnter={() => setTechnicianHighlight(idx)}
                      onClick={() => selectTechnician(t)}
                    >
                      {t.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <input type="hidden" name="technicianId" value={technicianId} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Equipamento</label>
            <input
              type="text"
              name="equipment"
              defaultValue={initialData?.equipment}
              className={inputClass}
              placeholder="Ex: Notebook Dell Inspiron"
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Número de série</label>
            <input
              type="text"
              name="serialNumber"
              defaultValue={initialData?.serialNumber}
              className={inputClass}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass}>Problema relatado</label>
          <textarea
            name="problem"
            rows={3}
            defaultValue={initialData?.problem}
            className={inputClass}
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass}>Observações internas</label>
          <textarea
            name="internalNotes"
            rows={2}
            defaultValue={initialData?.internalNotes}
            className={inputClass}
            autoComplete="off"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-black/10 p-6 dark:border-white/10">
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Peças</h2>
        <div className="flex flex-col gap-2">
          {parts.map((part, i) => {
            const filteredInventory = part.description.trim()
              ? inventoryParts
                  .filter((p) => p.name.toLowerCase().includes(part.description.toLowerCase()))
                  .slice(0, 8)
              : [];
            const linkedPart = part.partId ? inventoryParts.find((p) => p.id === part.partId) : null;
            const overStock = linkedPart ? part.quantity > linkedPart.quantity : false;

            const selectPart = (invPart: InventoryPart) => {
              const next = [...parts];
              next[i] = {
                ...next[i],
                partId: invPart.id,
                description: invPart.name,
                unitPrice: invPart.unitPrice,
              };
              setParts(next);
              setOpenPartDropdown(null);
              setPartHighlight(-1);
            };

            return (
              <div key={part.key} className="flex flex-col gap-1">
                <div className="grid grid-cols-[1fr_80px_120px_100px_32px] gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Descrição da peça (ou busque no estoque)"
                      className={inputClass + " w-full"}
                      value={part.description}
                      autoComplete="off"
                      onChange={(e) => {
                        const next = [...parts];
                        next[i] = { ...next[i], description: e.target.value, partId: "" };
                        setParts(next);
                        setOpenPartDropdown(part.key);
                        setPartHighlight(-1);
                      }}
                      onFocus={() => {
                        setOpenPartDropdown(part.key);
                        setPartHighlight(-1);
                      }}
                      onBlur={() => setTimeout(() => setOpenPartDropdown(null), 150)}
                      onKeyDown={(e) => {
                        if (openPartDropdown !== part.key || filteredInventory.length === 0) return;
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setPartHighlight((h) => (h + 1) % filteredInventory.length);
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setPartHighlight((h) => (h <= 0 ? filteredInventory.length - 1 : h - 1));
                        } else if (e.key === "Enter" && partHighlight >= 0) {
                          e.preventDefault();
                          selectPart(filteredInventory[partHighlight]);
                        } else if (e.key === "Escape") {
                          setOpenPartDropdown(null);
                          setPartHighlight(-1);
                        }
                      }}
                    />
                    {openPartDropdown === part.key && filteredInventory.length > 0 && (
                      <ul className="absolute top-full z-10 mt-1 w-full rounded-md border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-zinc-950">
                        {filteredInventory.map((invPart, idx) => (
                          <li key={invPart.id}>
                            <button
                              type="button"
                              className={`flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 ${
                                idx === partHighlight ? "bg-black/5 dark:bg-white/10" : ""
                              }`}
                              onMouseEnter={() => setPartHighlight(idx)}
                              onClick={() => selectPart(invPart)}
                            >
                              <span>{invPart.name}</span>
                              <span className="text-zinc-500">estoque: {invPart.quantity}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={part.quantity}
                    autoComplete="off"
                    onChange={(e) => {
                      const next = [...parts];
                      next[i] = { ...next[i], quantity: Number(e.target.value) || 1 };
                      setParts(next);
                    }}
                  />
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="Preço unit."
                    className={inputClass}
                    value={part.unitPrice}
                    autoComplete="off"
                    onChange={(e) => {
                      const next = [...parts];
                      next[i] = { ...next[i], unitPrice: Number(e.target.value) || 0 };
                      setParts(next);
                    }}
                  />
                  <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                    {currency(part.quantity * part.unitPrice)}
                  </div>
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                    onClick={() => setParts(parts.filter((p) => p.key !== part.key))}
                    aria-label="Remover peça"
                  >
                    ×
                  </button>
                </div>
                {linkedPart && (
                  <p className={`text-xs ${overStock ? "text-red-600 dark:text-red-400" : "text-zinc-500"}`}>
                    {overStock
                      ? `Estoque insuficiente: só há ${linkedPart.quantity} unidade(s) — a venda ficará negativa.`
                      : `Do estoque · disponível: ${linkedPart.quantity}`}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <button
          type="button"
          className="self-start text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
          onClick={() =>
            setParts([
              ...parts,
              { key: crypto.randomUUID(), partId: "", description: "", quantity: 1, unitPrice: 0 },
            ])
          }
        >
          + Adicionar peça
        </button>
        <p className="text-sm text-zinc-500">Total peças: {currency(totalParts)}</p>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-black/10 p-6 dark:border-white/10">
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Serviços executados</h2>
        <div className="flex flex-col gap-3">
          {services.map((service, i) => (
            <div key={service.key} className="flex flex-col gap-2 rounded-md border border-black/5 p-3 dark:border-white/5">
              <div className="grid grid-cols-[1fr_120px_32px] gap-2">
                <input
                  type="text"
                  placeholder="Descrição do serviço"
                  className={inputClass}
                  value={service.description}
                  autoComplete="off"
                  onChange={(e) => {
                    const next = [...services];
                    next[i] = { ...next[i], description: e.target.value };
                    setServices(next);
                  }}
                />
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="Preço"
                  className={inputClass}
                  value={service.unitPrice}
                  autoComplete="off"
                  onChange={(e) => {
                    const next = [...services];
                    next[i] = { ...next[i], unitPrice: Number(e.target.value) || 0 };
                    setServices(next);
                  }}
                />
                <button
                  type="button"
                  className="text-red-600 hover:text-red-700 dark:text-red-400"
                  onClick={() => setServices(services.filter((s) => s.key !== service.key))}
                  aria-label="Remover serviço"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-500">Início</label>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={service.startedAt}
                    autoComplete="off"
                    onChange={(e) => {
                      const next = [...services];
                      next[i] = { ...next[i], startedAt: e.target.value };
                      setServices(next);
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="mt-5 h-fit self-start text-xs font-medium text-zinc-600 underline dark:text-zinc-400"
                  onClick={() => {
                    const next = [...services];
                    next[i] = { ...next[i], startedAt: nowLocalDateTime() };
                    setServices(next);
                  }}
                >
                  Iniciar agora
                </button>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-500">Fim</label>
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={service.endedAt}
                    autoComplete="off"
                    onChange={(e) => {
                      const next = [...services];
                      next[i] = { ...next[i], endedAt: e.target.value };
                      setServices(next);
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="mt-5 h-fit self-start text-xs font-medium text-zinc-600 underline dark:text-zinc-400"
                  onClick={() => {
                    const next = [...services];
                    next[i] = { ...next[i], endedAt: nowLocalDateTime() };
                    setServices(next);
                  }}
                >
                  Finalizar agora
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="self-start text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
          onClick={() =>
            setServices([
              ...services,
              { key: crypto.randomUUID(), description: "", unitPrice: 0, startedAt: "", endedAt: "" },
            ])
          }
        >
          + Adicionar serviço
        </button>
        <p className="text-sm text-zinc-500">Total serviços: {currency(totalServices)}</p>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-black/10 p-6 dark:border-white/10">
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Detalhes da OS</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Data de entrada</label>
            <input
              type="date"
              name="entryDate"
              defaultValue={initialData?.entryDate ?? todayLocalDate()}
              className={inputClass}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Data prevista</label>
            <input
              type="date"
              name="expectedDate"
              defaultValue={initialData?.expectedDate}
              className={inputClass}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Data de término</label>
            <input
              type="date"
              name="completionDate"
              defaultValue={initialData?.completionDate}
              className={inputClass}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Data de saída</label>
            <input
              type="date"
              name="exitDate"
              defaultValue={initialData?.exitDate}
              className={inputClass}
              autoComplete="off"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 sm:w-48">
          <label className={labelClass}>Desconto (R$)</label>
          <input
            type="number"
            step="0.01"
            min={0}
            name="discount"
            className={inputClass}
            value={discount}
            autoComplete="off"
            onChange={(e) => setDiscount(Number(e.target.value) || 0)}
          />
        </div>

        <div className="flex flex-col items-end gap-1 border-t border-black/10 pt-4 dark:border-white/10">
          <p className="text-sm text-zinc-500">Peças: {currency(totalParts)}</p>
          <p className="text-sm text-zinc-500">Serviços: {currency(totalServices)}</p>
          {discount > 0 && <p className="text-sm text-zinc-500">Desconto: -{currency(discount)}</p>}
          <p className="text-lg font-semibold text-black dark:text-zinc-50">Total: {currency(total)}</p>
        </div>
      </section>

      <input type="hidden" name="partsJson" value={JSON.stringify(parts)} readOnly />
      <input type="hidden" name="servicesJson" value={JSON.stringify(services)} readOnly />
      {mode === "edit" && serviceOrderId && (
        <input type="hidden" name="serviceOrderId" value={serviceOrderId} readOnly />
      )}

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-black px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {pending ? "Salvando..." : mode === "edit" ? "Salvar alterações" : "Salvar Ordem de Serviço"}
        </button>
      </div>
    </form>
  );
}
