"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { createServiceOrder, updateServiceOrder, type ServiceOrderState } from "../actions";
import { CancelButton } from "@/components/CancelButton";
import { ConfirmSaveButton } from "@/components/ConfirmSaveButton";

type Customer = { id: string; name: string; phone: string | null };
type Technician = { id: string; name: string };
type InventoryPart = { id: string; name: string; quantity: number; unitPrice: number };
type CatalogService = { id: string; name: string; unitPrice: number };

type PartRow = {
  key: string;
  partId: string;
  description: string;
  quantity: string;
  unitPrice: string;
};
type ServiceRow = {
  key: string;
  description: string;
  hours: string;
  unitPrice: string;
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
  parts: { partId: string; description: string; quantity: number; unitPrice: number }[];
  services: { description: string; hours: number; unitPrice: number; startedAt: string; endedAt: string }[];
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

export function ServiceOrderForm({
  customers,
  technicians,
  inventoryParts,
  serviceCatalog,
  mode = "create",
  title,
  serviceOrderId,
  returnTo,
  initialData,
}: {
  customers: Customer[];
  technicians: Technician[];
  inventoryParts: InventoryPart[];
  serviceCatalog: CatalogService[];
  mode?: "create" | "edit";
  title?: string;
  serviceOrderId?: string;
  returnTo?: string;
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
      ? initialData.parts.map((p) => ({
          ...p,
          key: crypto.randomUUID(),
          quantity: String(p.quantity),
          unitPrice: String(p.unitPrice),
        }))
      : [{ key: crypto.randomUUID(), partId: "", description: "", quantity: "1", unitPrice: "" }]
  );
  const [openPartDropdown, setOpenPartDropdown] = useState<string | null>(null);
  const [partHighlight, setPartHighlight] = useState(-1);
  const [services, setServices] = useState<ServiceRow[]>(
    initialData?.services.length
      ? initialData.services.map((s) => ({
          ...s,
          key: crypto.randomUUID(),
          hours: String(s.hours),
          unitPrice: String(s.unitPrice),
        }))
      : [{ key: crypto.randomUUID(), description: "", hours: "1", unitPrice: "", startedAt: "", endedAt: "" }]
  );
  const [openServiceDropdown, setOpenServiceDropdown] = useState<string | null>(null);
  const [serviceHighlight, setServiceHighlight] = useState(-1);

  const partDescriptionRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const serviceDescriptionRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const formRef = useRef<HTMLFormElement>(null);

  const totalParts = parts.reduce((sum, p) => sum + (Number(p.quantity) || 0) * (Number(p.unitPrice) || 0), 0);
  const totalServices = services.reduce((sum, s) => sum + (Number(s.hours) || 0) * (Number(s.unitPrice) || 0), 0);
  const [discount, setDiscount] = useState(initialData?.discount ? String(initialData.discount) : "");
  const total = Math.max(0, totalParts + totalServices - (Number(discount) || 0));

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-8" autoComplete="off">
      <div className="sticky top-14 z-40 -mx-6 flex flex-wrap items-center justify-between gap-3 border-b border-black/10 bg-zinc-50/95 px-6 py-3 backdrop-blur dark:border-white/10 dark:bg-black/95">
        <h1 className="text-xl font-semibold text-black dark:text-zinc-50">{title}</h1>
        <div className="flex items-center gap-3">
          <CancelButton />
          {mode === "edit" && serviceOrderId && (
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium text-black hover:bg-black/5 dark:border-transparent dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Imprimir
            </button>
          )}
          {mode === "edit" ? (
            <ConfirmSaveButton
              formRef={formRef}
              pending={pending}
              label="Salvar alterações"
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            />
          ) : (
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {pending ? "Salvando..." : "Salvar Ordem de Serviço"}
            </button>
          )}
        </div>
      </div>
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
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <input type="hidden" name="customerId" value={customerId} />
                <button
                  type="button"
                  tabIndex={-1}
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
            const overStock = linkedPart ? (Number(part.quantity) || 0) > linkedPart.quantity : false;

            const selectPart = (invPart: InventoryPart) => {
              const next = [...parts];
              next[i] = {
                ...next[i],
                partId: invPart.id,
                description: invPart.name,
                unitPrice: String(invPart.unitPrice),
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
                      ref={(el) => {
                        if (el) partDescriptionRefs.current.set(part.key, el);
                        else partDescriptionRefs.current.delete(part.key);
                      }}
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
                    type="text"
                    inputMode="numeric"
                    data-numeric="integer"
                    className={inputClass}
                    value={part.quantity}
                    autoComplete="off"
                    onChange={(e) => {
                      const next = [...parts];
                      next[i] = { ...next[i], quantity: e.target.value };
                      setParts(next);
                    }}
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    data-numeric="decimal"
                    placeholder="Preço unit."
                    className={inputClass}
                    value={part.unitPrice}
                    autoComplete="off"
                    onChange={(e) => {
                      const next = [...parts];
                      next[i] = { ...next[i], unitPrice: e.target.value };
                      setParts(next);
                    }}
                  />
                  <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                    {currency((Number(part.quantity) || 0) * (Number(part.unitPrice) || 0))}
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
          onClick={() => {
            const newKey = crypto.randomUUID();
            setParts([...parts, { key: newKey, partId: "", description: "", quantity: "1", unitPrice: "" }]);
            requestAnimationFrame(() => partDescriptionRefs.current.get(newKey)?.focus());
          }}
        >
          + Adicionar peça
        </button>
        <p className="text-sm text-zinc-500">Total peças: {currency(totalParts)}</p>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-black/10 p-6 dark:border-white/10">
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Serviços executados</h2>
        <div className="flex flex-col gap-3">
          {services.map((service, i) => {
            const filteredCatalog = service.description.trim()
              ? serviceCatalog
                  .filter((s) => s.name.toLowerCase().includes(service.description.toLowerCase()))
                  .slice(0, 8)
              : [];

            const selectCatalogService = (catalogService: CatalogService) => {
              const next = [...services];
              next[i] = {
                ...next[i],
                description: catalogService.name,
                unitPrice: String(catalogService.unitPrice),
              };
              setServices(next);
              setOpenServiceDropdown(null);
              setServiceHighlight(-1);
            };

            return (
              <div key={service.key} className="flex flex-col gap-2 rounded-md border border-black/5 p-3 dark:border-white/5">
                <div className="grid grid-cols-[1fr_80px_120px_100px_32px] gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      ref={(el) => {
                        if (el) serviceDescriptionRefs.current.set(service.key, el);
                        else serviceDescriptionRefs.current.delete(service.key);
                      }}
                      placeholder="Descrição do serviço (ou busque no cadastro)"
                      className={inputClass + " w-full"}
                      value={service.description}
                      autoComplete="off"
                      onChange={(e) => {
                        const next = [...services];
                        next[i] = { ...next[i], description: e.target.value };
                        setServices(next);
                        setOpenServiceDropdown(service.key);
                        setServiceHighlight(-1);
                      }}
                      onFocus={() => {
                        setOpenServiceDropdown(service.key);
                        setServiceHighlight(-1);
                      }}
                      onBlur={() => setTimeout(() => setOpenServiceDropdown(null), 150)}
                      onKeyDown={(e) => {
                        if (openServiceDropdown !== service.key || filteredCatalog.length === 0) return;
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setServiceHighlight((h) => (h + 1) % filteredCatalog.length);
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setServiceHighlight((h) => (h <= 0 ? filteredCatalog.length - 1 : h - 1));
                        } else if (e.key === "Enter" && serviceHighlight >= 0) {
                          e.preventDefault();
                          selectCatalogService(filteredCatalog[serviceHighlight]);
                        } else if (e.key === "Escape") {
                          setOpenServiceDropdown(null);
                          setServiceHighlight(-1);
                        }
                      }}
                    />
                    {openServiceDropdown === service.key && filteredCatalog.length > 0 && (
                      <ul className="absolute top-full z-10 mt-1 w-full rounded-md border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-zinc-950">
                        {filteredCatalog.map((catalogService, idx) => (
                          <li key={catalogService.id}>
                            <button
                              type="button"
                              className={`flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 ${
                                idx === serviceHighlight ? "bg-black/5 dark:bg-white/10" : ""
                              }`}
                              onMouseEnter={() => setServiceHighlight(idx)}
                              onClick={() => selectCatalogService(catalogService)}
                            >
                              <span>{catalogService.name}</span>
                              <span className="text-zinc-500">{currency(catalogService.unitPrice)}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    data-numeric="decimal"
                    placeholder="Horas"
                    className={inputClass}
                    value={service.hours}
                    autoComplete="off"
                    onChange={(e) => {
                      const next = [...services];
                      next[i] = { ...next[i], hours: e.target.value };
                      setServices(next);
                    }}
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    data-numeric="decimal"
                    placeholder="Valor/hora"
                    className={inputClass}
                    value={service.unitPrice}
                    autoComplete="off"
                    onChange={(e) => {
                      const next = [...services];
                      next[i] = { ...next[i], unitPrice: e.target.value };
                      setServices(next);
                    }}
                  />
                  <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                    {currency((Number(service.hours) || 0) * (Number(service.unitPrice) || 0))}
                  </div>
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                    onClick={() => setServices(services.filter((s) => s.key !== service.key))}
                    aria-label="Remover serviço"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          className="self-start text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
          onClick={() => {
            const newKey = crypto.randomUUID();
            setServices([
              ...services,
              { key: newKey, description: "", hours: "1", unitPrice: "", startedAt: "", endedAt: "" },
            ]);
            requestAnimationFrame(() => serviceDescriptionRefs.current.get(newKey)?.focus());
          }}
        >
          + Adicionar serviço
        </button>
        <p className="text-sm text-zinc-500">Total serviços: {currency(totalServices)}</p>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-black/10 p-6 dark:border-white/10">
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">Detalhes da OS</h2>
        <div className={`grid gap-4 ${mode === "edit" ? "sm:grid-cols-4" : "sm:grid-cols-1"}`}>
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
          {mode === "edit" && (
            <>
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
            </>
          )}
        </div>
        {mode === "edit" && (
          <div className="flex flex-col gap-1 sm:w-48">
            <label className={labelClass}>Desconto (R$)</label>
            <input
              type="text"
              inputMode="decimal"
              data-numeric="decimal"
              name="discount"
              className={inputClass}
              value={discount}
              autoComplete="off"
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
        )}

        <div className="flex flex-col items-end gap-1 border-t border-black/10 pt-4 dark:border-white/10">
          <p className="text-sm text-zinc-500">Peças: {currency(totalParts)}</p>
          <p className="text-sm text-zinc-500">Serviços: {currency(totalServices)}</p>
          {(Number(discount) || 0) > 0 && (
            <p className="text-sm text-zinc-500">Desconto: -{currency(Number(discount) || 0)}</p>
          )}
          <p className="text-lg font-semibold text-black dark:text-zinc-50">Total: {currency(total)}</p>
        </div>
      </section>

      <input
        type="hidden"
        name="partsJson"
        value={JSON.stringify(
          parts.map((p) => ({ ...p, quantity: Number(p.quantity) || 0, unitPrice: Number(p.unitPrice) || 0 }))
        )}
        readOnly
      />
      <input
        type="hidden"
        name="servicesJson"
        value={JSON.stringify(
          services.map((s) => ({ ...s, hours: Number(s.hours) || 0, unitPrice: Number(s.unitPrice) || 0 }))
        )}
        readOnly
      />
      {mode === "edit" && serviceOrderId && (
        <input type="hidden" name="serviceOrderId" value={serviceOrderId} readOnly />
      )}
      {returnTo && <input type="hidden" name="returnTo" value={returnTo} readOnly />}

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}
