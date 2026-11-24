"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { renderMarkdown } from "@/lib/markdown";
import { cms, slugify } from "@/lib/cms";
import { Loading, StatusBadge, TagInput, friendly } from "@/components/admin/ui";
import { useToast } from "@/components/Toast";
import { LOCALE_LABEL, readingMinutes, type Locale, type PostDoc, type PostTr } from "@/content/posts";

const CATS = ["BA", "AI", "DỮ LIỆU", "NGÔN NGỮ"] as const;
const LOCALES: Locale[] = ["vi", "en", "zh"];
const today = () => new Date().toISOString().slice(0, 10);
const emptyTr = (): PostTr => ({ title: "", excerpt: "", body: "", seoTitle: "", seoDesc: "" });
const blank = (): PostDoc => ({ slug: "", cat: "BA", original: "vi", status: "draft", date: "", tags: [], tr: { vi: emptyTr() } });

export default function PostEditor() {
  const router = useRouter();
  const { flash, node } = useToast();
  const [id, setId] = useState<string | undefined>();
  const [post, setPost] = useState<PostDoc | null>(null);
  const [loc, setLoc] = useState<Locale>("vi");
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [savedAt, setSavedAt] = useState<string>("");
  const [slugTouched, setSlugTouched] = useState(false);
  const ta = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const pid = new URLSearchParams(location.search).get("id") ?? undefined;
    setId(pid);
    if (!pid) {
      setPost(blank());
      return;
    }
    cms.posts
      .get(pid)
      .then((p) => {
        if (!p) return setError("Không tìm thấy bài viết.");
        const { id: _omit, ...rest } = p;
        void _omit;
        setPost(rest);
        setLoc(p.original);
        setSlugTouched(true);
      })
      .catch((e) => setError(friendly(e)));
  }, []);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const tr = post?.tr[loc];
  const words = useMemo(() => (tr?.body || "").trim().split(/\s+/).filter(Boolean).length, [tr?.body]);

  if (!post) return <Loading error={error} />;

  const update = (p: Partial<PostDoc>) => {
    setPost({ ...post, ...p });
    setDirty(true);
  };
  const updateTr = (p: Partial<PostTr>) => {
    const cur = post.tr[loc] ?? emptyTr();
    const next: PostDoc = { ...post, tr: { ...post.tr, [loc]: { ...cur, ...p } } };
    if (p.title !== undefined && loc === post.original && !slugTouched) next.slug = slugify(p.title);
    setPost(next);
    setDirty(true);
  };

  const wrap = (before: string, after = before, placeholder = "chữ") => {
    const el = ta.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const sel = value.slice(s, e) || placeholder;
    const body = value.slice(0, s) + before + sel + after + value.slice(e);
    updateTr({ body });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  };
  const linePrefix = (prefix: string) => {
    const el = ta.current;
    if (!el) return;
    const { selectionStart: s, value } = el;
    const start = value.lastIndexOf("\n", s - 1) + 1;
    updateTr({ body: value.slice(0, start) + prefix + value.slice(start) });
    requestAnimationFrame(() => el.focus());
  };

  const save = async (status?: "draft" | "published") => {
    const next: PostDoc = { ...post, status: status ?? post.status };
    const main = next.tr[next.original];
    if (!main?.title.trim()) {
      setLoc(next.original);
      return flash(`Cần tiêu đề bản ${LOCALE_LABEL[next.original]} (ngôn ngữ gốc).`);
    }
    next.slug = slugify(next.slug || main.title);
    if (next.status === "published" && !next.date) next.date = today();
    // drop empty translations (title missing)
    next.tr = Object.fromEntries(Object.entries(next.tr).filter(([, t]) => t && t.title.trim())) as PostDoc["tr"];
    setBusy(true);
    try {
      const all = await cms.posts.list();
      if (all.some((p) => p.slug === next.slug && p.id !== id)) {
        setBusy(false);
        return flash("Đường dẫn này đã có bài khác dùng. Hãy đổi đường dẫn.");
      }
      const label = next.status === "published" ? (post.status === "published" ? `Đã cập nhật “${main.title}”` : `Đã xuất bản “${main.title}”`) : `Đã lưu nháp “${main.title}”`;
      const newId = await cms.posts.save(id, next, label);
      setPost(next);
      setDirty(false);
      setSavedAt(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
      if (!id) {
        setId(newId);
        router.replace(`/admin/bai-viet/sua/?id=${newId}`);
      }
      flash(next.status === "published" ? "Đã xuất bản — site sẽ cập nhật trong ~15 phút" : "Đã lưu nháp");
    } catch (e) {
      flash(friendly(e));
    } finally {
      setBusy(false);
    }
  };

  const seoTitle = tr?.seoTitle || (tr?.title ? `${tr.title} | góc Thương` : "");
  const seoDesc = tr?.seoDesc || tr?.excerpt || "";
  const zh = loc === "zh" ? "zh" : undefined;
  const tool = "inline-flex h-10 min-w-10 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent px-2 text-sm hover:bg-soft";

  return (
    <div className="mx-auto max-w-[1160px]">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5">
        <div className="flex items-center gap-4">
          <Link href="/admin/bai-viet/" aria-label="Quay lại danh sách" className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white no-underline">←</Link>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs tracking-[0.08em] text-muted">BÀI VIẾT / {id ? "CHỈNH SỬA" : "VIẾT MỚI"}</span>
            <span className="flex items-center gap-2 text-sm text-muted">
              <StatusBadge status={post.status} />
              {dirty ? "Có thay đổi chưa lưu" : savedAt ? `✓ Đã lưu lúc ${savedAt}` : ""}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-sm h-11 text-sm" onClick={() => setPreview(!preview)}>{preview ? "Soạn thảo" : "Xem trước"}</button>
          {post.status === "published" ? (
            <>
              <button type="button" disabled={busy} className="btn btn-sm h-11 text-sm" onClick={() => save("draft")}>Gỡ xuống nháp</button>
              <button type="button" disabled={busy} className="btn btn-dark btn-sm h-11 text-sm" onClick={() => save("published")}>Cập nhật</button>
            </>
          ) : (
            <>
              <button type="button" disabled={busy} className="btn btn-sm h-11 text-sm" onClick={() => save("draft")}>Lưu nháp</button>
              <button type="button" disabled={busy} className="btn btn-dark btn-sm h-11 text-sm" onClick={() => save("published")}>Xuất bản</button>
            </>
          )}
        </div>
      </div>

      <div role="tablist" aria-label="Ngôn ngữ" className="mb-4 inline-flex gap-1 rounded-xl bg-soft p-1">
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            aria-selected={loc === l}
            onClick={() => setLoc(l)}
            className={`h-11 cursor-pointer rounded-[10px] border-0 px-4 text-base font-medium ${loc === l ? "bg-white shadow-sm" : "bg-transparent"}`}
          >
            {LOCALE_LABEL[l]} <span className="text-sm font-normal text-muted">{l === post.original ? "gốc" : post.tr[l]?.title ? "đã có" : "chưa có"}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-5">
        <div className="card min-w-0 flex-[1_1_600px] overflow-hidden">
          {!preview && (
            <div className="flex flex-wrap items-center gap-1 border-b border-line px-3 py-2">
              <button type="button" className={tool} title="Tiêu đề mục" onClick={() => linePrefix("## ")}>H2</button>
              <button type="button" className={tool} title="Tiêu đề nhỏ" onClick={() => linePrefix("### ")}>H3</button>
              <button type="button" className={`${tool} font-bold`} title="Đậm" onClick={() => wrap("**")}>B</button>
              <button type="button" className={`${tool} italic`} title="Nghiêng" onClick={() => wrap("_")}>I</button>
              <button type="button" className={tool} title="Liên kết" onClick={() => wrap("[", "](https://)", "chữ liên kết")}>Link</button>
              <span className="mx-1 h-6 w-px bg-line" />
              <button type="button" className={tool} title="Danh sách" onClick={() => linePrefix("- ")}>• List</button>
              <button type="button" className={tool} title="Trích dẫn" onClick={() => linePrefix("> ")}>“ ”</button>
              <button type="button" className={tool} title="Ảnh (dán link ảnh)" onClick={() => wrap("![", "](https://)", "Chú thích ảnh")}>Ảnh</button>
              <button type="button" className={`${tool} font-mono`} title="Code" onClick={() => wrap("`")}>{"<>"}</button>
            </div>
          )}
          <div className="flex flex-col gap-4 px-6 py-7 sm:px-12">
            {preview ? (
              <>
                <h1 lang={zh} className="m-0 font-serif text-5xl leading-tight font-medium">{tr?.title || "(Chưa có tiêu đề)"}</h1>
                <p lang={zh} className="m-0 text-lg text-muted">{tr?.excerpt}</p>
                <div lang={zh} className="prose-gt border-t border-line pt-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(tr?.body || "_Chưa có nội dung._").html }} />
              </>
            ) : (
              <>
                <input
                  lang={zh}
                  aria-label="Tiêu đề"
                  className="w-full border-0 bg-transparent font-serif text-[clamp(32px,4vw,44px)] leading-tight font-medium outline-none placeholder:text-[#BDBDBD]"
                  placeholder={`Tiêu đề (${LOCALE_LABEL[loc]})`}
                  value={tr?.title ?? ""}
                  onChange={(e) => updateTr({ title: e.target.value })}
                />
                <textarea
                  lang={zh}
                  aria-label="Tóm tắt"
                  rows={2}
                  className="w-full resize-none border-0 border-b border-line bg-transparent pb-4 text-lg text-muted outline-none placeholder:text-[#BDBDBD]"
                  placeholder="Thêm tóm tắt 1–2 câu (hiện ở danh sách bài viết)…"
                  value={tr?.excerpt ?? ""}
                  onChange={(e) => updateTr({ excerpt: e.target.value })}
                />
                <textarea
                  ref={ta}
                  lang={zh}
                  aria-label="Nội dung"
                  className="min-h-[460px] w-full resize-y border-0 bg-transparent font-mono text-base leading-[1.8] outline-none placeholder:text-[#BDBDBD]"
                  placeholder={"Viết nội dung bằng Markdown…\n\n## Bối cảnh\nĐoạn văn…\n\n> Một câu đáng nhớ\n\n- Ý 1\n- Ý 2"}
                  value={tr?.body ?? ""}
                  onChange={(e) => updateTr({ body: e.target.value })}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                      e.preventDefault();
                      save();
                    }
                  }}
                />
              </>
            )}
          </div>
          <div className="flex justify-between border-t border-line px-5 py-3 font-mono text-xs text-muted">
            <span>{words} TỪ · ~{readingMinutes(tr?.body)} PHÚT ĐỌC</span>
            <span>MARKDOWN · CTRL+S ĐỂ LƯU</span>
          </div>
        </div>

        <div className="flex flex-[1_1_320px] flex-col gap-4">
          <section className="card flex flex-col gap-3 p-5">
            <h2 className="m-0 text-lg font-semibold">Xuất bản</h2>
            <label className="flabel">Ngôn ngữ gốc
              <select className="select" value={post.original} onChange={(e) => update({ original: e.target.value as Locale, tr: { [e.target.value]: emptyTr(), ...post.tr } })}>
                {LOCALES.map((l) => <option key={l} value={l}>{LOCALE_LABEL[l]}</option>)}
              </select>
            </label>
            <label className="flabel">Ngày đăng
              <input className="field" type="date" value={post.date} onChange={(e) => update({ date: e.target.value })} />
            </label>
            <span className="text-xs text-muted">Để trống: tự lấy ngày hôm nay khi xuất bản.</span>
          </section>

          <section className="card flex flex-col gap-3 p-5">
            <h2 className="m-0 text-lg font-semibold">Phân loại</h2>
            <label className="flabel">Chủ đề
              <select className="select" value={post.cat} onChange={(e) => update({ cat: e.target.value as PostDoc["cat"] })}>
                {CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <div className="flabel">Tags
              <TagInput value={post.tags} onChange={(tags) => update({ tags })} placeholder="Thêm tag…" upper />
            </div>
          </section>

          <section className="card flex flex-col gap-3 p-5">
            <h2 className="m-0 text-lg font-semibold">SEO &amp; xem trước trên Google</h2>
            <label className="flabel">Đường dẫn
              <span className="flex overflow-hidden rounded-[10px] border border-line-strong">
                <span className="flex items-center bg-soft px-2.5 font-mono text-xs">/bai-viet/</span>
                <input
                  className="min-w-0 flex-1 border-0 px-2.5 py-2.5 font-mono text-sm outline-none"
                  value={post.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    update({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") });
                  }}
                />
              </span>
            </label>
            <label className="flabel">
              <span className="flex justify-between">Tiêu đề SEO ({LOCALE_LABEL[loc]})<span className="font-mono text-xs">{seoTitle.length}/60</span></span>
              <input className="field" value={tr?.seoTitle ?? ""} placeholder={seoTitle} onChange={(e) => updateTr({ seoTitle: e.target.value })} />
            </label>
            <label className="flabel">
              <span className="flex justify-between">Mô tả SEO<span className="font-mono text-xs">{seoDesc.length}/160</span></span>
              <textarea className="field" rows={3} value={tr?.seoDesc ?? ""} placeholder="Mô tả ngắn hiện trên kết quả Google…" onChange={(e) => updateTr({ seoDesc: e.target.value })} />
            </label>
            <div className="flex flex-col gap-1 rounded-xl border border-line p-3.5 font-sans">
              <span className="text-xs text-[#4d5156]">gocthuong.com › bai-viet › {post.slug || "…"}</span>
              <span className="text-lg leading-snug text-[#1a0dab]">{seoTitle || "Tiêu đề bài viết | góc Thương"}</span>
              <span className="text-sm leading-snug text-[#4d5156]">{seoDesc || "Thêm mô tả SEO để Google hiển thị đoạn giới thiệu đúng ý bạn."}</span>
            </div>
          </section>
        </div>
      </div>
      {node}
    </div>
  );
}
