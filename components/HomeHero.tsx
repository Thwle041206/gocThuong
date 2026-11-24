"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { ArrowRight } from "./icons";

export default function HomeHero() {
  const { t, lang } = useLang();
  const h = t.hero;
  return (
    <section className="wrap flex flex-col gap-7 pt-20 pb-[72px] sm:pt-28">
      <p className="m-0 font-mono text-sm tracking-[0.08em]">{h.eyebrow}</p>
      <h1
        lang={lang === "zh" ? "zh" : undefined}
        className="m-0 max-w-[15ch] font-serif text-[clamp(48px,8vw,84px)] leading-[1.02] font-medium tracking-[-0.01em]"
      >
        {h.headline}
      </h1>
      <p className="m-0 max-w-[52ch] text-xl leading-[1.65] text-muted">{h.sub}</p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link href="/du-an/" className="btn btn-dark">
          {h.cta1} <ArrowRight />
        </Link>
        <a href="#lien-he" className="btn">
          {h.cta2}
        </a>
      </div>
    </section>
  );
}
