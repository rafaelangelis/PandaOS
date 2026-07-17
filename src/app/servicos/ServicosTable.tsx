"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

function currency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export type ServiceRow = {
  id: string;
  name: string;
  unitPrice: number;
};

export function ServicosTable({ services, canEdit }: { services: ServiceRow[]; canEdit: boolean }) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-black/5 text-zinc-600 dark:bg-white/5 dark:text-zinc-400">
          <tr>
            <th className="px-4 py-2">Nome</th>
            <th className="px-4 py-2">Valor</th>
            {canEdit && <th className="px-4 py-2"></th>}
          </tr>
        </thead>
        <tbody>
          {services.map((service) => {
            const href = `/servicos/${service.id}`;
            return (
              <tr
                key={service.id}
                onClick={canEdit ? () => router.push(href) : undefined}
                className={`border-t border-black/10 dark:border-white/10 ${
                  canEdit ? "cursor-pointer hover:bg-black/5 dark:hover:bg-white/5" : ""
                }`}
              >
                <td className="px-4 py-2">{service.name}</td>
                <td className="px-4 py-2">{currency(service.unitPrice)}</td>
                {canEdit && (
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={href}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
                    >
                      Editar
                    </Link>
                  </td>
                )}
              </tr>
            );
          })}
          {services.length === 0 && (
            <tr>
              <td colSpan={canEdit ? 3 : 2} className="px-4 py-4 text-center text-zinc-500">
                Nenhum serviço cadastrado ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
