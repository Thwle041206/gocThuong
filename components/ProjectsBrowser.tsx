"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { projectFilters, projects } from "@/content/projects";
import { Grid, List, Search } from "./icons";

export default function ProjectsBrowser() {
  const [f, setF] = useState("Tất cả");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"new" | "old">("new");
  const [view, setView] = useState<"grid" | "list">("grid");

  const shown = useMemo(() => {
    const cat = projectFilters.find((x) => x.label === f)?.cat;
    const ql = q.trim().toLowerCase();
    return projects
      .filter((p) => (!cat || p.cat === cat) && (!ql || `${p.title} ${p.kind} ${p.chips.join(" ")}`.toLowerCase().includes(ql)))
      .sort((a, b) => (sort === "new" ? b.year - a.year : a.year - b.year));
  }, [f, q, sort]);

  const clear = () => {
    setF("Tất cả");
    setQ("");
  };

  return (
    <>
      <section className="wrap flex flex-wrap items-end justify-between gap-6 pt-7">
        <div className="flex flex-col gap-3.5">
          <p className="eyebrow">● CASE STUDY BA &amp; AI</p>
          <h1 className="display">Dự án</h1>
          <p className="m-0 text-lg text-muted">Mỗi dự án: vấn đề, cách làm, kết quả đo được.</p>
        </div>
        <label className="search flex-[0_1_380px]">
          <Search />
          <span className="sr-only-x">Tìm dự án</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm dự án, công cụ…" />
        </label>
      </section>

      <section aria-label="Công cụ lọc" className="wrap pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-line py-3.5">
          <div role="group" aria-label="Chủ đề" className="flex flex-wrap items-center gap-2">
            {projectFilters.map((x) => (
              <button key={x.label} type="button" className="filter" aria-pressed={x.label === f} onClick={() => setF(x.label)}>
                {x.label.toUpperCase()} <span className="n">{x.cat ? projects.filter((p) => p.cat === x.cat).length : projects.length}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span role="status" className="font-mono text-xs text-muted">{shown.length} DỰ ÁN</span>
            <label className="flex items-center gap-2 text-sm text-muted">
              Sắp xếp
              <select className="select" value={sort} onChange={(e) => setSort(e.target.value as "new" | "old")}>
                <option value="new">Mới nhất</option>
                <option value="old">Cũ nhất</option>
              </select>
            </label>
            <div role="group" aria-label="Kiểu hiển thị" className="seg">
              <button type="button" aria-pressed={view === "grid"} aria-label="Xem dạng lưới" title="Lưới" onClick={() => setView("grid")}><Grid /></button>
              <button type="button" aria-pressed={view === "list"} aria-label="Xem dạng danh sách" title="Danh sách" onClick={() => setView("list")}><List /></button>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Danh sách dự án" className="wrap pt-7">
        {shown.length === 0 ? (
          <div className="empty">
            <span className="font-serif text-3xl">Không có dự án phù hợp</span>
            <span className="text-base text-muted">Thử từ khoá khác hoặc chọn “Tất cả”.</span>
            <button type="button" onClick={clear} className="btn btn-dark h-11 px-5 text-sm">Xoá bộ lọc</button>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(320px,100%),1fr))] gap-6">
            {shown.map((p) => (
              <Link key={p.slug} href={`/du-an/${p.slug}/`} className="card flex flex-col overflow-hidden no-underline">
                <div className="placeholder relative aspect-[16/10] bg-soft text-muted">
                  {p.img}
                  <span className="tag absolute top-3.5 left-3.5">{p.cat}</span>
                  <span className="absolute top-3.5 right-3.5 rounded border border-line bg-white px-2 py-[3px] text-xs">{p.year}</span>
                </div>
                <div className="flex flex-col gap-2.5 p-[22px]">
                  <span className="font-mono text-xs tracking-[0.08em] text-muted">{p.kind}</span>
                  <span className="font-serif text-3xl leading-[1.1] font-medium">{p.title}</span>
                  <span className="text-base leading-[1.55] text-muted">{p.summary}</span>
                  <div className="flex flex-wrap gap-1.5 border-t border-[#F0F0F0] pt-3">
                    {p.chips.map((c) => <span key={c} className="chip">{c}</span>)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {shown.map((p) => (
              <li key={p.slug}>
                <Link href={`/du-an/${p.slug}/`} className="card flex flex-wrap items-center gap-6 p-4 no-underline">
                  <div className="placeholder h-[140px] flex-[0_0_220px] rounded-[10px] bg-soft text-xs text-muted max-sm:flex-auto">{p.img}</div>
                  <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-2">
                    <div className="flex items-center gap-2 font-mono text-xs text-muted">
                      <span className="tag">{p.cat}</span>{p.kind} · {p.year}
                    </div>
                    <span className="font-serif text-3xl font-medium">{p.title}</span>
                    <span className="text-base text-muted">{p.summary}</span>
                  </div>
                  <div className="flex flex-[0_1_260px] flex-wrap gap-1.5">
                    {p.chips.map((c) => <span key={c} className="chip">{c}</span>)}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
