"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LANGS, useLang } from "@/lib/i18n";
import AccountButton from "./account/AccountButton";

export default function Header() {
  const path = usePathname() || "/";
  const { lang, setLang, t } = useLang();
  const items = [
    { href: "/", label: t.nav.home, match: (p: string) => p === "/" },
    { href: "/du-an/", label: t.nav.projects, match: (p: string) => p.startsWith("/du-an") },
    { href: "/bai-viet/", label: t.nav.posts, match: (p: string) => p.startsWith("/bai-viet") },
    { href: "/ket-noi/", label: t.nav.connect, match: (p: string) => p.startsWith("/ket-noi") },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="wrap flex flex-wrap items-center justify-between gap-x-2.5 gap-y-2.5 sm:gap-x-4 py-2.5 sm:py-3.5">
        <Link href="/" className="mr-auto flex items-center gap-3 no-underline sm:mr-0">
          <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-ink font-serif text-2xl font-semibold text-white">
            gT
          </span>
          <span className="flex flex-col leading-[1.2]">
            <span className="text-lg font-semibold">góc Thương</span>
            <span className="hidden text-xs text-muted sm:block">gocthuong.com</span>
          </span>
        </Link>
        <div className="contents sm:flex sm:max-w-full sm:flex-wrap sm:items-center sm:gap-2.5">
          <nav aria-label="Chính" className="order-last flex w-full max-w-full items-center gap-0.5 overflow-x-auto rounded-xl bg-ink p-1 sm:order-none sm:w-auto">
            {items.map((it) => {
              const active = it.match(path);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex h-11 shrink-0 items-center rounded-lg px-2 text-xs sm:px-3.5 sm:text-sm font-medium tracking-[0.04em] no-underline sm:tracking-[0.06em] ${
                    active ? "bg-[#2A2A2A] !text-white" : "!text-[#A1A1A1] hover:!text-white"
                  }`}
                >
                  {it.label}
                </Link>
              );
            })}
            <Link
              href="/#lien-he"
              className="ml-1 inline-flex h-11 shrink-0 items-center rounded-lg bg-white px-2.5 text-xs sm:px-4 sm:text-sm font-semibold tracking-[0.06em] !text-ink no-underline"
            >
              {t.nav.contact}
            </Link>
          </nav>
          <div role="group" aria-label={t.langGroup} className="flex rounded-xl border border-line p-0.5 font-mono text-xs">
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                aria-pressed={lang === l.id}
                onClick={() => setLang(l.id)}
                className={`h-10 min-w-9 cursor-pointer rounded-[10px] border-0 px-1 sm:h-11 sm:min-w-11 ${lang === l.id ? "bg-ink text-white" : "bg-transparent text-muted"}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <AccountButton />
        </div>
      </div>
    </header>
  );
}
