"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { postFilters, posts, type Post } from "@/content/posts";
import { Grid, Lines, List, Search } from "./icons";

const PAGE = 6;

export default function PostsBrowser() {
  const [f, setF] = useState("Tất cả");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"new" | "old" | "az">("new");
  const [view, setView] = useState<"grid" | "list" | "compact">("list");
  const [limit, setLimit] = useState(PAGE);

  const ql = q.trim().toLowerCase();
  const all = useMemo(() => {
    const cat = postFilters.find((x) => x.label === f)?.cat;
    const byDate = (a: Post, b: Post) => ((a.date || "0") < (b.date || "0") ? 1 : -1);
    const list = posts.filter((p) => (!cat || p.cat === cat) && (!ql || `${p.title} ${p.excerpt}`.toLowerCase().includes(ql)));
    if (sort === "new") list.sort(byDate);
    if (sort === "old") list.sort((a, b) => -byDate(a, b));
    if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title, "vi"));
    return list;
  }, [f, ql, sort]);
  const shown = all.slice(0, limit);
  const hasMore = all.length > limit;

  const parts = [f !== "Tất cả" ? f : "", ql ? `“${q}”` : ""].filter(Boolean);
  const clear = () => {
    setF("Tất cả");
    setQ("");
  };
  const href = (p: Post) => `/bai-viet/${p.slug}/`;

  return (
    <>
      <section className="wrap flex flex-col items-center gap-3.5 pt-20 text-center">
        <p className="eyebrow">GHI CHÉP · BA · AI · NGÔN NGỮ</p>
        <h1 className="display">Bài viết</h1>
        <p className="m-0 text-lg text-muted">Bài học từ công việc BA, thử nghiệm AI và hành trình học ngôn ngữ.</p>
      </section>

      <section aria-label="Công cụ lọc" className="wrap flex flex-col gap-4 pt-10">
        <div role="group" aria-label="Chủ đề" className="flex flex-wrap justify-center gap-2">
          {postFilters.map((x) => {
            const on = x.label === f;
            return (
              <button key={x.label} type="button" aria-pressed={on} onClick={() => setF(x.label)} className="filter filter-outline filter-pill !px-4 !font-sans !text-sm font-medium">
                {!on && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ink" />}
                {x.label.toUpperCase()} <span className="n font-mono text-xs">{x.cat ? posts.filter((p) => p.cat === x.cat).length : posts.length}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-line py-4">
          <span role="status" className="min-w-[110px] font-serif text-lg italic">{all.length} bài viết</span>
          <label className="search max-w-[520px] flex-[1_1_360px]">
            <Search />
            <span className="sr-only-x">Tìm bài viết</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tiêu đề, nội dung…" />
          </label>
          <div className="flex items-center gap-2.5">
            <label className="flex items-center gap-2 text-sm text-muted">
              Sắp xếp
              <select className="select" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
                <option value="new">Mới nhất</option>
                <option value="old">Cũ nhất</option>
                <option value="az">A → Z</option>
              </select>
            </label>
            <div role="group" aria-label="Kiểu hiển thị" className="seg">
              <button type="button" aria-pressed={view === "grid"} aria-label="Xem dạng lưới" title="Lưới" onClick={() => setView("grid")}><Grid /></button>
              <button type="button" aria-pressed={view === "list"} aria-label="Xem dạng danh sách" title="Danh sách" onClick={() => setView("list")}><List /></button>
              <button type="button" aria-pressed={view === "compact"} aria-label="Xem dạng gọn" title="Gọn" onClick={() => setView("compact")}><Lines /></button>
            </div>
          </div>
        </div>
        {parts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            Đang lọc:
            <span className="inline-flex h-8 items-center rounded-lg bg-soft px-3 text-ink">{parts.join(" + ")}</span>
            <button type="button" onClick={clear} className="h-11 cursor-pointer border-0 bg-transparent px-2 text-sm font-semibold text-ink underline underline-offset-4">Xoá bộ lọc</button>
          </div>
        )}
      </section>

      <section aria-label="Danh sách bài viết" className="wrap pt-7">
        {all.length === 0 && (
          <div className="empty">
            <span className="font-serif text-3xl">Không tìm thấy bài viết</span>
            <span className="text-base text-muted">Thử từ khoá khác hoặc bỏ bớt bộ lọc.</span>
            <button type="button" onClick={clear} className="btn btn-dark h-11 px-5 text-sm">Xoá bộ lọc</button>
          </div>
        )}

        {all.length > 0 && view === "grid" && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-6">
            {shown.map((p) => (
              <Link key={p.slug} href={href(p)} className="card flex flex-col overflow-hidden no-underline">
                <div className="mx-3 mt-3 flex aspect-[16/10] flex-col items-center justify-center gap-2 rounded-[10px] bg-panel p-5 text-center text-white">
                  <span className="font-serif text-2xl leading-[1.2]">{p.title}</span>
                  <span className="font-mono text-xs tracking-[0.08em] text-dim">{p.cat}</span>
                </div>
                <div className="flex flex-1 flex-col gap-2.5 px-5 pt-[18px] pb-5">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted">
                    <span className="tag">{p.cat}</span>
                    <span>{p.lang} · {p.dateLabel}</span>
                  </div>
                  <span className="font-serif text-2xl leading-[1.2] font-medium">{p.title}</span>
                  <span className="line-clamp-2 text-base leading-relaxed text-muted">{p.excerpt}</span>
                  <div className="mt-auto flex items-center justify-between border-t border-[#F0F0F0] pt-3.5 text-sm">
                    <span className="text-muted">Thương · {p.read}</span>
                    <span className="font-semibold tracking-[0.04em]">ĐỌC BÀI ↗</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {all.length > 0 && view === "list" && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(520px,100%),1fr))] gap-5">
            {shown.map((p) => (
              <Link key={p.slug} href={href(p)} className="card flex flex-wrap gap-5 p-4 no-underline">
                <div className="flex h-[140px] flex-[0_0_200px] items-center justify-center rounded-[10px] bg-panel p-4 text-center font-serif text-lg leading-[1.2] text-white max-sm:flex-auto">{p.title}</div>
                <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted">
                    <span className="tag">{p.cat}</span>
                    <span>{p.lang} · {p.dateLabel}</span>
                  </div>
                  <span className="font-serif text-2xl leading-[1.2] font-medium">{p.title}</span>
                  <span className="line-clamp-2 text-sm leading-[1.55] text-muted">{p.excerpt}</span>
                  <div className="mt-auto flex justify-between text-sm"><span className="text-muted">Thương · {p.read}</span><span className="font-semibold">ĐỌC BÀI ↗</span></div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {all.length > 0 && view === "compact" && (
          <ul className="m-0 list-none border-t border-line p-0">
            {shown.map((p) => (
              <li key={p.slug} className="border-b border-line">
                <Link href={href(p)} className="flex flex-wrap items-baseline gap-x-7 gap-y-1.5 px-1 py-[18px] no-underline">
                  <span className="flex-[0_0_110px] font-mono text-xs text-muted">{p.dateLabel}</span>
                  <span className="min-w-0 flex-[1_1_420px] font-serif text-2xl font-medium">{p.title}</span>
                  <span className="flex-[0_0_150px] font-mono text-xs text-muted">{p.cat} · {p.lang}</span>
                  <span className="flex-[0_0_64px] text-right text-sm text-muted">{p.read}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {hasMore && (
          <div className="flex justify-center pt-10">
            <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="btn btn-sm text-sm font-semibold tracking-[0.04em]">XEM THÊM BÀI VIẾT</button>
          </div>
        )}
      </section>
    </>
  );
}
