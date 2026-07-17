import { requirePermission } from "@/lib/permissions";
import { NewFinancialAccountForm } from "./NewFinancialAccountForm";

export default async function NovaContaFinanceiraPage() {
  await requirePermission("contasFinanceiras", "edit");

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 font-sans">
      <h1 className="mb-6 text-2xl font-semibold text-black dark:text-zinc-50">Nova conta financeira</h1>
      <NewFinancialAccountForm />
    </div>
  );
}
