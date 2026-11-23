"use client";

import Link from "next/link";
import { useState } from "react";
import { samples, timeline } from "@/content/journey";

const MAX = 90;

export function Timeline() {
  const [tl, setTl] = useState<"all" | "zh" | "en">("all");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const groups = timeline.filter((g) => tl === "all" || g.key === tl);
  const filters: [typeof tl, string][] = [["all", "Tất cả"], ["zh", "中文"], ["en", "English"]];

  return (
    <section aria-labelledby="h-time" className="wrap flex flex-wrap gap-10 pt-[72px]">
      <div className="flex flex-[0_1_280px] flex-col gap-3">
        <h2 id="h-time" className="h2-sm leading-[1.05]">Quá trình chi tiết</h2>
        <p className="m-0 text-[15px] leading-relaxed text-muted">Từng mốc, kèm chứng chỉ hoặc sản phẩm để kiểm chứng.</p>
        <div role="group" aria-label="Lọc theo ngôn ngữ" className="flex flex-wrap gap-1.5 pt-1">
          {filters.map(([id, label]) => (
            <button key={id} type="button" aria-pressed={tl === id} onClick={() => setTl(id)} className="filter filter-outline filter-pill !font-sans !text-[13px] !tracking-normal">
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="min-w-0 flex-[1_1_600px] rounded-2xl border border-line px-5 py-2 sm:px-7">
        {groups.map((g, gi) => (
          <div key={g.key} className={`py-6 ${gi < groups.length - 1 ? "border-b border-line" : ""}`}>
            <div className="flex items-center gap-4 pb-2">
              <span aria-hidden="true" className="flex h-12 w-12 flex-none items-center justify-center rounded-[10px] bg-ink font-mono text-xs text-white">{g.abbr}</span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[17px] font-semibold">{g.name}</span>
                <span className="text-sm text-muted">{g.meta}</span>
              </span>
            </div>
            <ol className="m-0 list-none p-0">
              {g.items.map((e, i) => {
                const long = e.text.length > MAX;
                const isOpen = !!open[e.id];
                return (
                  <li key={e.id} className="flex gap-5">
                    <div className="flex flex-[0_0_48px] flex-col items-center">
                      {e.st === "next" && <span aria-hidden="true" className="mt-[22px] box-border h-3.5 w-3.5 rounded-full border-2 border-dashed border-[#9A9A9A]" />}
                      {e.st === "now" && <span aria-hidden="true" className="mt-[22px] h-3.5 w-3.5 rounded-full bg-ink shadow-[0_0_0_4px_#E3E3E3]" />}
                      {e.st === "done" && <span aria-hidden="true" className="mt-[22px] h-3.5 w-3.5 rounded-full bg-[#BDBDBD]" />}
                      {i < g.items.length - 1 && <span aria-hidden="true" className="mt-1.5 w-0.5 flex-1 bg-line" />}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-4">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold">{e.title}</span>
                        {e.st === "next" && <span className="rounded border border-dashed border-[#9A9A9A] px-1.5 py-0.5 font-mono text-[10px] text-muted">SẮP TỚI</span>}
                        {e.st === "now" && <span className="rounded bg-ink px-1.5 py-0.5 font-mono text-[10px] text-white">ĐANG LÀM</span>}
                      </span>
                      <span className="text-sm text-muted">{e.when}</span>
                      <p className="mt-1.5 mb-0 text-[15px] leading-relaxed text-[#3A3A3A]">
                        {long && !isOpen ? e.text.slice(0, MAX).trim() : e.text}
                        {long && (
                          <>
                            {" "}
                            <button type="button" aria-expanded={isOpen} onClick={() => setOpen({ ...open, [e.id]: !isOpen })} className="h-7 cursor-pointer border-0 bg-transparent px-1 text-sm text-muted">
                              {isOpen ? "thu gọn" : "…xem thêm"}
                            </button>
                          </>
                        )}
                      </p>
                      {e.link && (
                        <a href="#" className="mt-1.5 inline-flex items-center gap-2.5 self-start rounded-[10px] border border-line py-2 pr-3 pl-2 text-[13px] no-underline">
                          <span aria-hidden="true" className="h-[30px] w-10 rounded-md bg-panel" />
                          {e.link}
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TranslationSamples() {
  const [sid, setSid] = useState("us");
  const [cols, setCols] = useState({ en: true, vi: true, zh: true });
  const smp = samples.find((s) => s.id === sid)!;
  const onCount = Object.values(cols).filter(Boolean).length;
  const keys = ["en", "vi", "zh"] as const;
  const labels = { en: "EN", vi: "VI", zh: "中文" };

  return (
    <section aria-labelledby="h-work" className="wrap flex flex-col gap-5 pt-[88px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="eyebrow">SẢN PHẨM THẬT · 01</p>
          <h2 id="h-work" className="h2-sm">Bản luyện dịch song song</h2>
        </div>
        <div role="group" aria-label="Chọn ngôn ngữ để so sánh" className="flex gap-1.5 font-mono text-xs">
          {keys.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={cols[k]}
              onClick={() => {
                if (cols[k] && onCount <= 2) return; // keep at least two columns to compare
                setCols({ ...cols, [k]: !cols[k] });
              }}
              className={`h-10 min-w-14 cursor-pointer rounded-full border px-3 ${cols[k] ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink"}`}
            >
              {cols[k] ? `✓ ${labels[k]}` : labels[k]}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line">
        <div role="tablist" aria-label="Mẫu dịch" className="flex flex-wrap gap-1 border-b border-line bg-[#FAFAFA] px-3">
          {samples.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={s.id === sid}
              onClick={() => setSid(s.id)}
              className={`h-[50px] cursor-pointer border-0 border-b-2 bg-transparent px-3.5 text-sm ${s.id === sid ? "border-ink font-semibold" : "border-transparent text-muted"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
          {keys.filter((k) => cols[k]).map((k) => (
            <div key={k} lang={k} className="flex flex-col gap-3.5 border-r border-[#F0F0F0] p-6">
              <span className="font-mono text-[11px] tracking-[0.08em] text-muted">{smp[k].head}</span>
              <p className="m-0 font-serif text-[22px] leading-[1.45]">{smp[k].story}</p>
              <div className="flex flex-col gap-2 text-sm leading-relaxed text-[#3A3A3A]">
                {smp[k].ac.map((a) => <span key={a} className="rounded-lg bg-mist px-3 py-2.5">{a}</span>)}
              </div>
            </div>
          ))}
        </div>
        {smp.terms.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-line px-6 py-5">
            <span className="font-mono text-[11px] tracking-[0.08em] text-muted">THUẬT NGỮ TRONG ĐOẠN NÀY</span>
            <div className="flex flex-wrap gap-2">
              {smp.terms.map(([en, vi, zh]) => (
                <span key={en} className="inline-flex items-center gap-2.5 rounded-[10px] border border-line px-3 py-2 text-[13px]">
                  <b className="font-semibold">{en}</b><span className="text-muted">{vi}</span><span lang="zh">{zh}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-[#FAFAFA] px-6 py-3.5 text-[13px] text-muted">
          <span>{smp.note}</span>
          <Link href="/bai-viet/" className="font-semibold">Đọc bài phân tích cách dịch →</Link>
        </div>
      </div>
    </section>
  );
}
