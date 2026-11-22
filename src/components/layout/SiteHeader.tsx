"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/create", label: "Create Bill" },
  { href: "/bill", label: "Table Check" },
  { href: "/xo", label: "XO Contract" },
];

function isRouteActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const isCreatePage = pathname === "/create";

  return (
    <header className="sticky top-0 z-30 border-b border-[#E4E4E7] bg-[#FAF9F6]/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="group inline-flex shrink-0 items-center gap-2.5 focus-visible:outline-none"
        >
          <span className="flex size-9 items-center justify-center rounded-2xl border-[1.5px] border-[#18181B] bg-[#FFFFFF] p-1.5 shadow-xs transition-transform duration-200 group-hover:-rotate-6 sm:size-10">
            <img
              src="/mascots/logo-mark.png"
              alt="CakeSplit mascot mark"
              width={28}
              height={28}
              className="size-6 object-contain sm:size-7"
            />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-[#111111] sm:text-xl">
            CakeSplit
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 rounded-full border border-[#E4E4E7] bg-[#FFFFFF] p-1 md:flex"
        >
          {NAV_ITEMS.map((item) => {
            const active = isRouteActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[#18181B] text-[#FAF9F6]"
                    : "text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#111111]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <span
            aria-label="Bitcoin Cash Mainnet"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#18181B]/25 bg-[#FFFFFF] px-3 py-1 font-mono text-[11px] font-bold text-[#111111]"
          >
            <span
              className="size-1.5 rounded-full bg-[#18181B]"
              aria-hidden="true"
            />
            <span>Mainnet</span>
          </span>

          {!isCreatePage ? (
            <Link
              href="/create"
              className="ink-pill-primary inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold sm:px-4 sm:text-sm"
            >
              <span>Start a Split</span>
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="flex items-center gap-1 overflow-x-auto border-t border-[#E4E4E7]/80 px-4 py-2 md:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const active = isRouteActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                active
                  ? "bg-[#18181B] text-[#FAF9F6]"
                  : "text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#111111]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
