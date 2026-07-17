"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/login/actions";

export type NavLink = { href: string; label: string };

export function TopNav({
  links,
  groupedLinks,
  groupLabel = "Cadastro",
  userName,
}: {
  links: NavLink[];
  groupedLinks: NavLink[];
  groupLabel?: string;
  userName: string;
}) {
  const pathname = usePathname();
  const [groupOpen, setGroupOpen] = useState(false);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const groupActive = groupedLinks.some((link) => isActive(link.href));

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-zinc-50/90 backdrop-blur dark:border-white/10 dark:bg-black/90">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/" className="mr-2 text-sm font-semibold text-black dark:text-zinc-50">
            PandaOS
          </Link>
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
                    : "rounded-md border border-black/10 px-4 py-2 text-sm font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
                }
              >
                {link.label}
              </Link>
            );
          })}
          {groupedLinks.length > 0 && (
            <div
              className="relative"
              tabIndex={-1}
              onBlur={() => setTimeout(() => setGroupOpen(false), 150)}
            >
              <button
                type="button"
                onClick={() => setGroupOpen((o) => !o)}
                className={
                  groupActive
                    ? "rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
                    : "rounded-md border border-black/10 px-4 py-2 text-sm font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
                }
              >
                {groupLabel} ▾
              </button>
              {groupOpen && (
                <ul className="absolute left-0 top-full z-10 mt-1 min-w-[10rem] rounded-md border border-black/10 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-zinc-950">
                  {groupedLinks.map((link) => {
                    const active = isActive(link.href);
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setGroupOpen(false)}
                          className={`block px-3 py-2 text-sm ${
                            active
                              ? "font-medium text-black dark:text-zinc-50"
                              : "text-zinc-600 hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/5"
                          }`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-zinc-500 sm:inline">{userName}</span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-black/10 px-3 py-2 text-sm font-medium text-black hover:bg-black/5 dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5"
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
