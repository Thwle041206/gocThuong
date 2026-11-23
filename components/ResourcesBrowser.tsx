"use client";

import { useEffect, useMemo, useState } from "react";
import { resourceTabs, resources, topics } from "@/content/resources";
import { ArrowUpRight, Copy, Heart, Plus, Search } from "./icons";
import { copyLink, useToast } from "./Toast";

export default function ResourcesBrowser() {
  const [f, setF] = useState("Tất cả");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"top" | "az">("top");
  const [view, setView] = useState<"grouped" | "flat">("grouped");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const { flash, node } = useToast();

  // Likes are remembered in this browser only until the backend (Sprint 6) exists.
  useEffect(() => {
    try {
      setLiked(JSON.parse(localStorage.getItem("liked") || "{}"));
    } catch {}
  }, []);
  const toggle = (id: number | string) => {
    const next = { ...liked, [id]: !liked[id] };
    setLiked(next);
    try {
      localStorage.setItem("liked", JSON.stringify(next));
    } catch {}
  };

  const flat = view === "flat";
  const rows = useMemo(() => {
    const cat = resourceTabs.find((x) => x.label === f)?.cat;
    const ql = q.trim().toLowerCase();
    return resources
      .filter((r) => (!cat || r.cat === cat) && (!ql || `${r.title} ${r.desc} ${r.by}`.toLowerCase().includes(ql)))
      .map((r) => ({ ...r, count: r.likes + (liked[r.id] ? 1 : 0) }))
      .sort((a, b) => (sort === "az" ? a.title.localeCompare(b.title, "vi") : b.count - a.count));
  }, [f, q, sort, liked]);

  const groups = flat
    ? rows.length
      ? [{ name: "", items: rows }]
      : []
    : Object.keys(topics)
        .map((k) => ({ name: topics[k], items: rows.filter((r) => r.cat === k) }))
        .filter((g) => g.items.length);

  return (
    <>
      <section className="wrap flex flex-wrap items-end justify-between gap-6 pt-20">
        <div className="flex flex-col gap-3.5">
          <p className="eyebrow">● {resources.length} TÀI LIỆU · {Object.keys(topics).length} CHỦ ĐỀ</p>
          <h1 className="display">Tài nguyên chia sẻ</h1>
          <p className="m-0 text-lg text-muted">Link và tài liệu chọn lọc cho BA, AI và người học ngôn ngữ.</p>
        </div>
        <button type="button" onClick={() => flash("Form chia sẻ tài liệu sẽ mở ở giai đoạn sau")} className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-xl border-0 bg-ink px-[22px] font-medium text-white">
          <Plus /> Chia sẻ tài liệu
        </button>
      </section>

      <section aria-label="Công cụ lọc" className="wrap flex flex-col gap-3.5 pt-8">
        <label className="search h-14 px-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <Search size={20} />
          <span className="sr-only-x">Tìm tài liệu</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tài liệu, mô tả, người chia sẻ…" className="!text-base" />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3.5">
          <div role="group" aria-label="Chủ đề" className="flex flex-wrap gap-2">
            {resourceTabs.map((x) => (
              <button key={x.label} type="button" aria-pressed={x.label === f} onClick={() => setF(x.label)} className="filter filter-outline !font-sans !text-sm !tracking-normal">
                {x.label} <span className="n font-mono text-[11px]">{x.cat ? resources.filter((r) => r.cat === x.cat).length : resources.length}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-[13px] text-muted">
              Sắp xếp
              <select className="select" value={sort} onChange={(e) => setSort(e.target.value as "top" | "az")}>
                <option value="top">Phổ biến</option>
                <option value="az">A → Z</option>
              </select>
            </label>
            <div role="group" aria-label="Kiểu hiển thị" className="seg">
              <button type="button" aria-pressed={!flat} onClick={() => setView("grouped")}>Theo chủ đề</button>
              <button type="button" aria-pressed={flat} onClick={() => setView("flat")}>Danh sách</button>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Danh sách tài nguyên" className="wrap flex flex-col gap-10 pt-7">
        {groups.map((g) => (
          <div key={g.name || "all"} className="flex flex-wrap gap-x-10 gap-y-4">
            {!flat && (
              <div className="flex flex-[0_0_220px] flex-col gap-1.5 pt-3.5">
                <h2 className="m-0 font-serif text-[30px] font-medium">{g.name}</h2>
                <span className="font-mono text-xs text-muted">{g.items.length} TÀI LIỆU</span>
              </div>
            )}
            <ul className="m-0 flex min-w-0 flex-[1_1_560px] list-none flex-col gap-2.5 p-0">
              {g.items.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[14px] border border-line bg-white px-5 py-4">
                  <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-1">
                    <a href={r.url} target={r.url.startsWith("http") ? "_blank" : undefined} rel="nofollow ugc noopener" className="inline-flex items-center gap-2 text-base font-medium no-underline">
                      {r.title} <ArrowUpRight />
                    </a>
                    <span className="text-sm leading-[1.55] text-muted">{r.desc}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-muted">
                    {flat && <span className="tag">{r.cat}</span>}
                    <span className="min-w-[92px] px-1">{r.by}</span>
                    <button
                      type="button"
                      aria-pressed={!!liked[r.id]}
                      aria-label={liked[r.id] ? "Bỏ thích" : "Thích"}
                      onClick={() => toggle(r.id)}
                      className={`inline-flex h-11 min-w-16 cursor-pointer items-center gap-1.5 rounded-[10px] border px-3 text-[13px] ${liked[r.id] ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink"}`}
                    >
                      <Heart filled={!!liked[r.id]} />
                      {r.count || "—"}
                    </button>
                    <button
                      type="button"
                      aria-label="Sao chép link"
                      onClick={async () => {
                        await copyLink(r.url.startsWith("http") ? r.url : undefined);
                        flash("Đã sao chép link");
                      }}
                      className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] border border-line-strong bg-white"
                    >
                      <Copy />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="empty">
            <span className="font-serif text-[30px]">Chưa có tài liệu phù hợp</span>
            <span className="text-[15px] text-muted">Thử từ khoá khác — hoặc chia sẻ tài liệu đầu tiên.</span>
            <button type="button" onClick={() => { setF("Tất cả"); setQ(""); }} className="btn btn-dark h-11 px-5 text-sm">Xoá bộ lọc</button>
          </div>
        )}
      </section>
      {node}
    </>
  );
}
