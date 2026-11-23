"use client";

import { useEffect, useState } from "react";

/** Sticky "on this page" list that highlights the section in view. */
export default function Toc({ title, items, numbered = false }: { title: string; items: { id: string; label: string }[]; numbered?: boolean }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label={title} className="flex flex-col gap-1.5 md:sticky md:top-6">
      <span className="label pb-2">{title.toUpperCase()}</span>
      {items.map((t, i) => (
        <a key={t.id} href={`#${t.id}`} className="toc-link" aria-current={t.id === active ? "location" : undefined} onClick={() => setActive(t.id)}>
          {numbered && <span className="font-mono text-[11px]">{String(i + 1).padStart(2, "0")}</span>}
          {t.label}
        </a>
      ))}
    </nav>
  );
}
