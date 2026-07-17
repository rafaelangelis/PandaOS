export const MODULES = [
  { key: "os", label: "Ordens de Serviço" },
  { key: "clientes", label: "Clientes" },
  { key: "financeiro", label: "Financeiro" },
  { key: "estoque", label: "Estoque" },
  { key: "servicos", label: "Serviços" },
  { key: "contasFinanceiras", label: "Contas Financeiras" },
  { key: "usuarios", label: "Usuários e Permissões" },
] as const;

export type ModuleKey = (typeof MODULES)[number]["key"];
