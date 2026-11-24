"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cms } from "@/lib/cms";
import { Loading, PageHead, StatusBadge, fmtDate, useLoad } from "@/components/admin/ui";
import { LOCALE_LABEL, type Locale } from "@/content/posts";
import { Plus, Search } from "@/components/icons";

const CATS = ["BA", "AI", "DỮ LIỆU", "NGÔN NGỮ"];

export default function AdminPosts() {
  const { data, error, reload, setData } = useLoad(() => cms.posts.list());
  const [tab, setTab] = useState<"all" | "published" | "draft">("all");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [lang, setLang] = useState("");

  useEffect(() => {
    const t = new URLSearchParams(location.search).get("tab");
    if (t === "draft" || t === "published") setTab(t);
  }, []);

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return (data ?? [])
      .filter((p) => tab === "all" || (tab === "published" ? p.status === "published" : p.status !== "published"))
      .filter((p) => !cat || p.cat === cat)
      .filter((p) => !lang || p.tr[lang as Locale])
      .filter((p) => !ql || Object.values(p.tr).some((t) => t?.title.toLowerCase().includes(ql)) || p.slug.includes(ql))
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  }, [data, tab, q, cat, lang]);

  const count = (s: "all" | "published" | "draft") => (data ?? []).filter((p) => s === "all" || (s === "published" ? p.status === "published" : p.status !== "published")).length;

  return (
    <div className="mx-auto max-w-[1160px]">
      <PageHead
        title="Bài viết"
        sub="Viết, dịch và xuất bản bài viết bằng VI · EN · 中文."
        action={<Link href="/admin/bai-viet/sua/" className="btn btn-dark h-12 text-sm"><Plus /> Viết bài mới</Link>}
      />
      {!data ? (
        <Loading error={error} onRetry={reload} />
      ) : (
        <div className="card overflow-hidden">
          <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-line px-3">
            {(
              [
                ["all", "Tất cả"],
                ["published", "Đã xuất bản"],
                ["draft", "Bản nháp"],
              ] as const
            ).map(([id, label]) => (
              <button key={id} role="tab" aria-selected={tab === id} type="button" onClick={() => setTab(id)} className={`flex h-[52px] shrink-0 cursor-pointer items-center gap-2 border-0 border-b-2 bg-transparent px-3 text-[15px] ${tab === id ? "border-ink font-semibold" : "border-transparent text-muted"}`}>
                {label}
                <span className={`rounded-full px-1.5 font-mono text-[11px] ${tab === id ? "bg-ink text-white" : "bg-soft"}`}>{count(id)}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
            <label className="search h-11 min-w-[220px] flex-1 rounded-[10px]">
              <Search size={16} />
              <span className="sr-only-x">Lọc theo tiêu đề</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Lọc theo tiêu đề…" />
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">Chủ đề
              <select className="select" value={cat} onChange={(e) => setCat(e.target.value)}>
                <option value="">Tất cả</option>
                {CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">Ngôn ngữ
              <select className="select" value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="vi">VI</option>
                <option value="en">EN</option>
                <option value="zh">中文</option>
              </select>
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="text-[13px] text-muted">
                  <th className="px-4 py-3 font-normal">Tiêu đề</th>
                  <th className="px-3 font-normal">Chủ đề</th>
                  <th className="px-3 font-normal">Bản dịch</th>
                  <th className="px-3 font-normal">Trạng thái</th>
                  <th className="px-3 font-normal">Cập nhật</th>
                  <th className="px-4 text-right font-normal">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const t = p.tr[p.original] ?? Object.values(p.tr)[0];
                  return (
                    <tr key={p.id} className="border-t border-line">
                      <td className="px-4 py-3.5">
                        <Link href={`/admin/bai-viet/sua/?id=${p.id}`} className="flex flex-col no-underline">
                          <span lang={p.original === "zh" ? "zh" : undefined} className="text-[16px] font-medium">{t?.title || "(Chưa có tiêu đề)"}</span>
                          <span className="font-mono text-xs text-muted">/bai-viet/{p.slug}</span>
                        </Link>
                      </td>
                      <td className="px-3"><span className="tag">{p.cat}</span></td>
                      <td className="px-3">
                        <span className="flex gap-1">
                          {(["vi", "en", "zh"] as Locale[]).map((l) => (
                            <span key={l} title={p.tr[l] ? "Đã có" : "Chưa có"} className={`rounded px-1.5 py-0.5 font-mono text-[11px] ${p.tr[l] ? "border border-ink" : "border border-dashed border-[#BDBDBD] text-muted"}`}>
                              {p.tr[l] ? "" : "+"}{LOCALE_LABEL[l]}
                            </span>
                          ))}
                        </span>
                      </td>
                      <td className="px-3"><StatusBadge status={p.status} /></td>
                      <td className="px-3 text-[15px] text-muted">{p.status === "published" && p.date ? p.date.split("-").reverse().join(".") : fmtDate(p.updatedAt)}</td>
                      <td className="px-4 text-right whitespace-nowrap">
                        <Link href={`/admin/bai-viet/sua/?id=${p.id}`} className="inline-flex h-10 items-center rounded-lg px-3 text-sm no-underline hover:bg-soft">Sửa</Link>
                        {p.status === "published" && <a href={`/bai-viet/${p.slug}/`} target="_blank" className="inline-flex h-10 items-center rounded-lg px-3 text-sm no-underline hover:bg-soft">Xem</a>}
                        <button
                          type="button"
                          className="h-10 cursor-pointer rounded-lg border-0 bg-transparent px-3 text-sm text-muted hover:bg-soft"
                          onClick={async () => {
                            if (!confirm(`Xoá bài “${t?.title}”? Không thể hoàn tác.`)) return;
                            await cms.posts.remove(p.id, t?.title ?? p.slug);
                            setData((data ?? []).filter((x) => x.id !== p.id));
                          }}
                        >
                          Xoá
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length === 0 && <p className="m-0 p-10 text-center text-muted">Không có bài viết phù hợp.</p>}
          </div>
          <div className="border-t border-line px-4 py-3 text-right text-sm text-muted">{rows.length} bài</div>
        </div>
      )}
    </div>
  );
}
