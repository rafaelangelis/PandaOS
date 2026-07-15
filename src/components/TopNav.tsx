"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";

export type NavLink = { href: string; label: string };

export function TopNav({ links, userName }: { links: NavLink[]; userName: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-zinc-50/90 backdrop-blur dark:border-white/10 dark:bg-black/90">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/" className="mr-2 text-sm font-semibold text-black dark:text-zinc-50">
            PandaOS
          </Link>
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
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
