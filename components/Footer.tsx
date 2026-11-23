"use client";

import Link from "next/link";
import { site } from "@/content/site";
import { useLang } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLang();
  const f = t.footer;
  return (
    <footer className="px-4 pt-[88px] pb-8 sm:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-8 rounded-[20px] bg-ink p-10 text-white">
        <div className="flex flex-[1_1_280px] flex-col gap-2.5">
          <span className="text-xl font-semibold">{site.name}</span>
          <span className="max-w-[36ch] text-sm leading-relaxed text-dim">{site.tagline}</span>
          <span className="pt-3 font-mono text-xs text-dim">© {new Date().getFullYear()} GÓC THƯƠNG</span>
        </div>
        <nav aria-label="Chân trang" className="flex flex-wrap gap-14">
          <div className="flex flex-col gap-2.5 text-sm">
            <span className="label !text-dim">{f.pages}</span>
            <Link href="/" className="!text-white no-underline">{f.home}</Link>
            <Link href="/du-an/" className="!text-white no-underline">{f.projects}</Link>
            <Link href="/bai-viet/" className="!text-white no-underline">{f.posts}</Link>
            <Link href="/ket-noi/" className="!text-white no-underline">{f.connect}</Link>
            <Link href="/hanh-trinh-ngon-ngu/" className="!text-white no-underline">{f.journey}</Link>
          </div>
          <div className="flex flex-col gap-2.5 text-sm">
            <span className="label !text-dim">{f.contact}</span>
            <a href={site.social.linkedin} className="!text-white no-underline">LinkedIn</a>
            <a href={site.social.github} className="!text-white no-underline">GitHub</a>
            <a href={`mailto:${site.email}`} className="!text-white no-underline">Email</a>
          </div>
        </nav>
      </div>
    </footer>
  );
}
