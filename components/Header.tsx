"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LANGS, useLang } from "@/lib/i18n";
import AccountButton from "./account/AccountButton";

// Wide screens (lg and up): full menu in the bar.
// Phones and tablets: logo, account and a ☰ button; the menu opens as a panel under the bar.
export default function Header() {
  const path = usePathname() || "/";
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const items = [
    { href: "/", label: t.nav.home, match: (p: string) => p === "/" },
    { href: "/du-an/", label: t.nav.projects, match: (p: string) => p.startsWith("/du-an") },
    { href: "/bai-viet/", label: t.nav.posts, match: (p: string) => p.startsWith("/bai-viet") },
    { href: "/ket-noi/", label: t.nav.connect, match: (p: string) => p.startsWith("/ket-noi") },
  ];

  // Close the menu after navigating and on Escape.
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const langSwitch = (cls: string) => (
    <div role="group" aria-label={t.langGroup} className={`flex rounded-xl border border-line p-0.5 font-mono text-xs ${cls}`}>
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          aria-pressed={lang === l.id}
          onClick={() => setLang(l.id)}
          className={`h-11 min-w-11 flex-1 cursor-pointer rounded-[10px] border-0 px-1 ${lang === l.id ? "bg-ink text-white" : "bg-transparent text-muted"}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="wrap flex items-center justify-between gap-4 py-2.5 lg:py-3.5">
        <Link href="/" className="flex min-w-0 items-center gap-3 no-underline">
          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-ink font-serif text-2xl font-semibold text-white">
            gT
          </span>
          <span className="flex min-w-0 flex-col leading-[1.2]">
            <span className="truncate text-lg font-semibold">góc Thương</span>
            <span className="hidden text-xs text-muted sm:block">gocthuong.com</span>
          </span>
        </Link>

        <div className="flex items-center gap-2.5">
          <nav aria-label="Chính" className="hidden items-center gap-0.5 rounded-xl bg-ink p-1 lg:flex">
            {items.map((it) => {
              const active = it.match(path);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex h-11 shrink-0 items-center rounded-lg px-3.5 text-sm font-medium tracking-[0.06em] no-underline ${
                    active ? "bg-[#2A2A2A] !text-white" : "!text-[#A1A1A1] hover:!text-white"
                  }`}
                >
                  {it.label}
                </Link>
              );
            })}
            <Link href="/#lien-he" className="ml-1 inline-flex h-11 shrink-0 items-center rounded-lg bg-white px-4 text-sm font-semibold tracking-[0.06em] !text-ink no-underline">
              {t.nav.contact}
            </Link>
          </nav>
          {langSwitch("hidden lg:flex")}
          <AccountButton />
          <button
            type="button"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-line-strong bg-white lg:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div id="menu-mobile" className="border-t border-line bg-white lg:hidden">
          <nav aria-label="Chính" className="wrap flex flex-col gap-1 py-3">
            {items.map((it) => {
              const active = it.match(path);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-12 items-center rounded-lg px-3 text-base no-underline ${active ? "bg-soft font-semibold" : ""}`}
                >
                  {it.label}
                </Link>
              );
            })}
            <Link href="/#lien-he" onClick={() => setOpen(false)} className="btn btn-dark btn-sm mt-2">
              {t.nav.contact}
            </Link>
            {langSwitch("mt-2")}
          </nav>
        </div>
      )}
    </header>
  );
}
