"use client";

export function MesFilterInput({ defaultValue }: { defaultValue: string }) {
  return (
    <form action="/dashboard" method="get">
      <input
        type="month"
        name="mes"
        defaultValue={defaultValue}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-black/10 bg-transparent px-2 py-1 text-xs text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30"
      />
    </form>
  );
}
