# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

PandaOS was restarted from zero (old repo deleted and recreated on GitHub: https://github.com/rafaelangelis/PandaOS).

**Stack (decided 2026-07-14):**
- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS
- Prisma ORM + SQLite (`prisma/dev.db`, local file) — chosen to get started with zero setup; swap the `datasource` provider to Postgres later for production
- Auth: custom username/password (bcryptjs for hashing, `jose` for signed JWT session cookies) — no NextAuth/third-party auth library. Session cookie name: `pandaos_session`, httpOnly, 7-day expiry.
- Route protection via `src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`; the exported function must be named `proxy`, not `middleware` — this is a breaking rename from Next 15, not a typo)
- No signup flow — this is a closed, permission-based system. Users are created via `prisma/seed.ts` (`npm run db:seed`) or, later, an admin-only user management screen. Seeded default: `admin` / `admin123` — change before anything resembling production use.

**Implemented so far (2026-07-15):**
- Auth: login/logout with sessions (`User` model + `isAdmin` bypass flag for bootstrapping the first account)
- **OS module** (`/os`, `/os/novo`, `/os/[id]`, `/os/[id]/editar`): create/list/view/edit service orders with customer (inline quick-create), technician, equipment, problem description, parts (`ServiceOrderPart`), services with start/end time tracking (`ServiceOrderService`), dates, discount, computed totals. Loosely modeled on Bling's "Ordem de Serviço" screen (`Vendas > Serviços > Ordens de serviço`), trimmed to the decided scope only (no garantia/laudo técnico fields). The list (`/os`) filters by `entryDate` and defaults to **today only** (a "Hoje" chip shows this), with a "De"/"Até" period filter form (`?from=&to=`, inclusive, UTC day boundaries) and a "Ver todas as OS" link (`?all=1`) to clear the date filter entirely. Combines with the existing `?status=` filter.
- **Edit OS** (`/os/[id]/editar`, 2026-07-15): `ServiceOrderForm.tsx` now takes optional `mode="edit"` + `serviceOrderId` + `initialData` props (default `mode="create"` keeps `/os/novo` unchanged) and dispatches to a new `updateServiceOrder` action (`src/app/os/actions.ts`) instead of `createServiceOrder`. An "Editar OS" button shows on the OS detail page (`/os/[id]`) whenever `can(user, "os", "edit")`. `updateServiceOrder` replaces the OS's parts/services wholesale (`deleteMany` + `create` in one nested write) and reconciles inventory stock by first **incrementing back** the quantities the OS's *previous* parts had consumed, then decrementing for the *new* part list — net effect is correct stock regardless of what changed. Status is intentionally not editable here (it's driven by the "Converter em Venda" flow in `src/app/vendas/actions.ts`, which sets it to `"vendida"`) — don't add a status field to this form without checking that flow first.
- All DB-backed fields on the "Nova OS" form (`ServiceOrderForm.tsx`) use the same as-you-type search combobox pattern — Cliente, Peça (inventory), and Técnico — instead of native `<select>` dropdowns (2026-07-15: Técnico converted from `<select>` to match). No plain `<select>` should be introduced for a DB-backed field here; reuse this combobox pattern instead.
- `ServiceOrderForm.tsx` has `autoComplete="off"` on the `<form>` and on every individual `<input>`/`<textarea>` (2026-07-15, per explicit user request) so the browser doesn't offer its own native autofill suggestions on top of (or instead of) the app's custom dropdowns, and doesn't remember typed values across sessions. Keep this on any new field added to this form.
- Cliente/Técnico/Peça comboboxes only show suggestions once the user has typed something — focusing an empty field shows nothing (decided via AskUserQuestion, 2026-07-15: applied consistently to all three, not just Cliente which was the one explicitly asked about). The `filtered*` memos return `[]` for an empty/whitespace query instead of a "browse all" slice; don't reintroduce a full-list-on-focus fallback here.
- Same three comboboxes support keyboard navigation (2026-07-15): ArrowDown/ArrowUp move a `*Highlight` index (`customerHighlight`/`technicianHighlight`/`partHighlight`, the last shared across rows since only one part row's dropdown is open at a time), Enter selects the highlighted item via a shared `select*`/`selectPart` function (and is `preventDefault`ed so it doesn't fall through to submitting the form), Escape closes the dropdown. Mouse hover also updates the highlight (`onMouseEnter`) so keyboard and mouse stay in sync.
- **Permissions** (`/usuarios`, `/usuarios/grupos/*`): admin-configurable `PermissionGroup`s with a Visualizar/Editar checkbox grid per module (`os`, `clientes`, `financeiro`, `usuarios` — see `src/lib/modules.ts`), plus per-user `UserPermissionOverride` (inherit/allow/deny per module) layered on top of the group. Checked server-side via `requirePermission()`/`can()` in `src/lib/permissions.ts`, called at the top of every protected page and server action — there is no client-side-only gating.
- **Vendas/Financeiro** (`/financeiro`, `src/app/vendas/actions.ts`): "Converter em Venda" on an OS detail page creates a `Sale` (1:1 with the OS) with N `SaleInstallment` rows (parcelamento, due dates spaced monthly) and — if the OS has a technician with `commissionRate > 0` — a `Commission` row (rate applied only to the services total, not parts; generated at sale-creation time, not on payment). `/financeiro` lists Contas a Receber (mark-as-paid) and Comissões, gated by the `financeiro` module permission. Contas a Receber has a filter form (2026-07-15): `?from=&to=` (inclusive, UTC day boundaries, matches `SaleInstallment.dueDate`) and `?cliente=` (substring match on customer name, case-insensitive — done in JS after fetch since the SQLite Prisma provider doesn't support `mode: "insensitive"`). Filters combine (AND). A "Limpar filtro" link appears when any filter is active. Comissões is not filtered by this form. The Contas a Receber table itself only renders once a filter is active (2026-07-15, per explicit request) — with no filter set, the query isn't even run and a "Use os filtros acima..." prompt shows instead; don't reintroduce a default "show everything" list here.
- **Estoque** (`/estoque`, `/estoque/novo`, `/estoque/[id]`, `src/app/estoque/actions.ts`): `Part` inventory model (name, SKU, quantity, minStock, unitPrice). Decided behavior (asked via AskUserQuestion, 2026-07-15):
  - OS parts can either be picked from inventory (search combobox in `ServiceOrderForm`, same UX pattern as the Cliente combobox) or typed as free text with no stock link — both are valid, `ServiceOrderPart.partId` is nullable.
  - Stock deducts automatically and immediately when the OS is created (not when converted to sale) — see the loop after `serviceOrder.create` in `src/app/os/actions.ts`.
  - Insufficient stock does **not** block saving — it just shows a non-blocking red warning in the form ("a venda ficará negativa") and the `Part.quantity` is allowed to go negative. Don't add a blocking check here unless the user asks to change this.
  - Low-stock threshold (`minStock`) is per-part, not a global constant.
  - Low-stock alerts show in two places: highlighted rows + a count banner on `/estoque` itself, and a dismiss-free banner on the home page (`src/app/page.tsx`) — both gated by `can(user, "estoque", "view")`.
- **Clientes** (`/clientes`, `/clientes/novo`, `/clientes/[id]`, `/clientes/[id]/editar`): standalone customer directory with name search (`?q=`), and a detail page showing full OS history per customer (status, technician, computed total, linking out to `/os/[id]`). Customers can still be created inline from the OS form too (unchanged) — this screen is the dedicated view/edit path the original scope asked for. The Cliente name on the OS detail page now links here.
- **Dashboard** (`/dashboard`): decided via AskUserQuestion (2026-07-15) as its own route (not a home replacement), shown in the fixed nav whenever the user can view `os` or `financeiro`. Blocks: OS por status (counts from `groupBy`, each linking to `/os?status=X`, a new query-param filter added to the OS list for this), Faturamento do mês (sum of `Sale.totalAmount` created this calendar month), Contas a receber (sum of pending `SaleInstallment`s, with an "atrasadas" sub-count/sum for ones past due). Each block is gated independently by its own module permission (`os` / `financeiro`), so a technician with OS-view + Financeiro-view sees both, someone with only OS sees just that block.
- **Fixed top nav** (`src/components/TopNav.tsx`, rendered from the root `layout.tsx`): replaced the old per-page/home-only nav links. Shows module links filtered by `can(user, key, "view")`, highlights the active section by pathname, plus username + Sair. Rendered site-wide (any authenticated page) via the root layout calling `getCurrentUser()`/`can()` itself — pages no longer render their own nav links. Uses `sticky top-0`, not `fixed`, so it doesn't overlap content. The header intentionally has no `max-w` wrapper (full width) — a `max-w-4xl` wrapper was tried first and caused the link group and user/logout group to wrap onto two lines once a 6th link (Dashboard) was added.

**Known gotchas hit while building this:**
- Next.js 16 renamed `middleware.ts` → `proxy.ts` (exported fn must be named `proxy`) — already applied, see `src/proxy.ts`.
- Date-only fields (`entryDate`, `dueDate`, etc.) are stored as UTC midnight; always format with `toLocaleDateString("pt-BR", { timeZone: "UTC" })` or the displayed date shifts a day depending on server timezone. `formatDateTime` (with time-of-day, e.g. service start/end) should NOT force UTC — only pure dates.
- A constant/type shared by both a Server Component (`requirePermission`, which imports `next/headers`) and a Client Component (checkbox grids) must live in its own file with no server-only imports — see `src/lib/modules.ts` vs `src/lib/permissions.ts`. Importing `MODULES` from `permissions.ts` into a `"use client"` file breaks the build.
- Prisma 7 changed how `datasource.url` works in the schema (driver adapters required); this project pins Prisma **6.19.3** deliberately for the simpler SQLite setup. Don't `npm i prisma@latest` without re-checking this.
- On Windows, the dev server locks the Prisma query-engine `.dll` — `prisma migrate dev` / `prisma generate` fail with `EPERM` while `npm run dev` is running. Kill node processes (`taskkill //F //IM node.exe` in git-bash) before schema changes, then restart the dev server.

**Not implemented yet (still open from "Decided feature scope" below):**
- Profit-per-OS reporting (R$ and % per service order)
- Contas a pagar (only Contas a Receber exists so far, derived from `SaleInstallment`)
- Audit log (who did what, when)
- WhatsApp/SMS status-change notifications

Dev server: `npm run dev` (Turbopack, hot-reload). Prisma commands: `npx prisma migrate dev`, `npx prisma generate`, `npm run db:seed`. Default seeded users after this round: `admin`/`admin123` (isAdmin, bypasses all permission checks) and `joao`/`joao123` (test technician, group "Técnicos", 10% commission) — the latter was created ad hoc through the UI during testing, not via the seed script, so it won't reappear on a fresh `db:seed` run against a new database.

## What PandaOS is

A web system for managing **Ordens de Serviço (OS)** for a **cell phone / computer repair shop** (assistência técnica de celular e informática). Users log in with username/password; each user has permissions that control what they can see and do.

## Decided feature scope

These were chosen deliberately out of a broader market survey (see "Market research" below) — treat this list as the actual scope, not the full list of things competitors do.

**Gestão de OS**
- Time tracking per service (log start/end of work on an OS)
- Convert a finished OS directly into a sale/invoice (no re-entering data)

**Permissions**
- Freely-named, admin-configurable permission groups (not fixed roles like "technician/manager") — checkbox grid per module
- Per-user permission overrides on top of the group's permissions
- Audit log: who did what, and when

**Financeiro**
- Profit-per-OS reporting (R$ and % per service order)
- Automatic commission calculation for technicians/salespeople
- Contas a pagar/receber (accounts payable/receivable)

**Estoque**
- Automatic stock deduction when a part is used on an OS or sale
- Low-stock alerts

**Comunicação com cliente**
- Automatic status-change notifications via API (SMS/WhatsApp Business) — not a manual "click to open WhatsApp Web" link

**Clientes**
- Customer registration with full OS history per customer

## Explicitly out of scope (for now)

Decided against, don't add unless the user asks again:
- Laudo técnico (formal technical report field)
- Customer-visible OS status funnel/stepper
- Fiscal invoice emission (NF-e/NFC-e) / built-in PDV
- Unified inbox (email+SMS+social in one thread)
- Personalized appointment reminders (tech photo/name/bio)
- AI receptionist / proactive AI assistant
- Customizable message templates
- Equipment registration linked to customer (brand/model/serial/IMEI)
- Warranty tracking

**Open/undecided:** external integrations (fiscal emission, accounting tools like QuickBooks) — this was asked but not answered; revisit with the user before assuming either way.

## Market research summary

A deep-research pass (2026-07-13) surveyed Brazilian and international repair-shop management systems to source the feature list above. Key sources: GestãoClick, vhsys, InforOS, AssistênciaPro, OrganizaOS, Nuvem Gestor, Empresarius (BR); RepairShopr, RepairDesk (international). Most evidence is vendor marketing material, not independent benchmarking — treat specifics (pricing, "real-time" claims) with some skepticism.

Notable patterns found (beyond what was chosen above, kept here for future reference if scope expands):
- BR market's dominant permission model is admin-defined groups with per-module checkboxes, not fixed roles — this shaped the "Permissions" decision above.
- RepairShopr's "Security Groups" allow a user to belong to multiple groups with different permission levels per area (e.g., a technician with admin rights only on time-clock) — a more granular alternative if the simple group model proves limiting later.
- RepairDesk Connect offers a unified inbox (email+SMS+social); RepairShopr supports two-way SMS/MMS with customizable templates and appointment reminders that introduce the assigned technician (photo/name/bio).
- Proactive AI assistants exist in this niche (e.g., OrganizaOS's "Pranchetinha": flags stalled OS, upcoming/overdue bills, answers revenue questions) and RepairDesk's 24/7 AI Receptionist that answers calls and books jobs — both explicitly declined for PandaOS's initial scope.
- Reported pricing at time of research: AssistênciaPro R$79/month (1 user, single plan); RepairDesk from $119/month (annual); RepairShopr from $129.99/month (annual). OrganizaOS's tiered pricing claim did not survive verification — treat as unconfirmed.
- Several originally-named BR competitors (ExpressLog, LWSAC, ControlOS, CorujaSoft, TinySoft, MeuPC.net, SIGO, GTECH OS, iAssist, ADM Assist, Central OS, Fix OS, Track-OS, Bling's OS module) produced no verified claims in this research round — absence here doesn't mean they lack these features, just that they weren't confirmed by reliable sources this pass.
