"use client";

import { useMemo, useState } from "react";

export function ClienteFilterInput({
  customerNames,
  defaultValue,
}: {
  customerNames: string[];
  defaultValue?: string;
}) {
  const [query, setQuery] = useState(defaultValue ?? "");
  const [showList, setShowList] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return customerNames.filter((name) => name.toLowerCase().includes(q)).slice(0, 8);
  }, [customerNames, query]);

  function select(name: string) {
    setQuery(name);
    setShowList(false);
    setHighlight(-1);
  }

  return (
    <div className="relative flex flex-col gap-1">
      <label className="text-xs font-medium text-zinc-500">Cliente</label>
      <input
        type="text"
        name="cliente"
        value={query}
        autoComplete="off"
        placeholder="Nome do cliente"
        className="rounded-md border border-black/10 bg-transparent px-3 py-1.5 text-sm text-black outline-none focus:border-black/30 dark:border-white/10 dark:text-zinc-50 dark:focus:border-white/30"
        onChange={(e) => {
          setQuery(e.target.value);
          setShowList(true);
          setHighlight(-1);
        }}
        onFocus={() => query.trim() && setShowList(true)}
        onBlur={() => setTimeout(() => setShowList(false), 150)}
        onKeyDown={(e) => {
          if (!showList || filtered.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((i) => (i + 1) % filtered.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((i) => (i <= 0 ? filtered.length - 1 : i - 1));
          } else if (e.key === "Enter" && highlight >= 0) {
            e.preventDefault();
            select(filtered[highlight]);
          } else if (e.key === "Escape") {
            setShowList(false);
            setHighlight(-1);
          }
        }}
      />
      {showList && filtered.length > 0 && (
        <ul className="absolute top-full z-10 mt-1 w-full min-w-48 rounded-md border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-zinc-950">
          {filtered.map((name, idx) => (
            <li key={name}>
              <button
                type="button"
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 ${
                  idx === highlight ? "bg-black/5 dark:bg-white/10" : ""
                }`}
                onMouseEnter={() => setHighlight(idx)}
                onClick={() => select(name)}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
