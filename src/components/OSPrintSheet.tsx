export type OSPrintPart = { id: string; description: string; quantity: number; unitPrice: number };
export type OSPrintService = { id: string; description: string; hours: number; unitPrice: number };

export type OSPrintData = {
  number: number;
  status: string;
  customerName: string;
  customerPhone: string | null;
  technicianName: string | null;
  entryDateStr: string;
  equipment: string | null;
  serialNumber: string | null;
  problem: string | null;
  discount: number;
  parts: OSPrintPart[];
  services: OSPrintService[];
};

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function OSPrintSheet({ data }: { data: OSPrintData }) {
  const totalParts = data.parts.reduce((s, p) => s + p.quantity * p.unitPrice, 0);
  const totalServices = data.services.reduce((s, sv) => s + sv.hours * sv.unitPrice, 0);
  const total = Math.max(0, totalParts + totalServices - data.discount);

  return (
    <div id="os-print-sheet" className="hidden print:block">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          #os-print-sheet {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #os-print-sheet table {
            width: 100% !important;
          }
          #os-print-sheet th:first-child,
          #os-print-sheet td:first-child {
            padding-left: 0 !important;
          }
          #os-print-sheet th:last-child,
          #os-print-sheet td:last-child {
            padding-right: 0 !important;
          }
          #os-print-sheet .print-half-sheet {
            height: 133mm;
            padding-bottom: 4mm;
            border-bottom: 1px dashed #999;
          }
        }
      `}</style>
      <div className="print-half-sheet flex flex-col gap-3 font-sans text-black">
        <div className="flex items-center justify-between border-b border-black/20 pb-2">
          <h1 className="text-base font-bold">Ordem de Serviço #{data.number}</h1>
          <span className="text-xs capitalize">{data.status}</span>
        </div>

        <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-xs">
          <div>
            <p className="text-[10px] text-zinc-500">Cliente</p>
            <p className="font-medium">{data.customerName}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500">Telefone</p>
            <p className="font-medium">{data.customerPhone ?? "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500">Técnico</p>
            <p className="font-medium">{data.technicianName ?? "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500">Data de entrada</p>
            <p className="font-medium">{data.entryDateStr}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500">Equipamento</p>
            <p className="font-medium">{data.equipment ?? "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500">Número de série</p>
            <p className="font-medium">{data.serialNumber ?? "—"}</p>
          </div>
        </div>

        <div className="text-xs">
          <p className="text-[10px] text-zinc-500">Problema relatado</p>
          <p className="font-medium">{data.problem ?? "—"}</p>
        </div>

        {data.parts.length > 0 && (
          <table className="w-full text-left text-[10px]">
            <thead>
              <tr className="border-b border-black/20 text-zinc-500">
                <th className="py-0.5">Peça</th>
                <th className="py-0.5 text-right">Qtd</th>
                <th className="py-0.5 text-right">Unit.</th>
                <th className="py-0.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.parts.map((p) => (
                <tr key={p.id} className="border-b border-black/5">
                  <td className="py-0.5">{p.description}</td>
                  <td className="py-0.5 text-right">{p.quantity}</td>
                  <td className="py-0.5 text-right">{currency(p.unitPrice)}</td>
                  <td className="py-0.5 text-right">{currency(p.quantity * p.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data.services.length > 0 && (
          <table className="w-full text-left text-[10px]">
            <thead>
              <tr className="border-b border-black/20 text-zinc-500">
                <th className="py-0.5">Serviço</th>
                <th className="py-0.5 text-right">Horas</th>
                <th className="py-0.5 text-right">Valor/h</th>
                <th className="py-0.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.services.map((s) => (
                <tr key={s.id} className="border-b border-black/5">
                  <td className="py-0.5">{s.description}</td>
                  <td className="py-0.5 text-right">{s.hours}</td>
                  <td className="py-0.5 text-right">{currency(s.unitPrice)}</td>
                  <td className="py-0.5 text-right">{currency(s.hours * s.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex flex-col items-end gap-0.5 border-t border-black/20 pt-2 text-xs">
          <p className="text-[10px] text-zinc-500">Peças: {currency(totalParts)}</p>
          <p className="text-[10px] text-zinc-500">Serviços: {currency(totalServices)}</p>
          {data.discount > 0 && <p className="text-[10px] text-zinc-500">Desconto: -{currency(data.discount)}</p>}
          <p className="text-sm font-bold">Total: {currency(total)}</p>
        </div>
      </div>
    </div>
  );
}
