"use client";

import { useEffect, useState } from "react";
import { cms, slugify, type WithId } from "@/lib/cms";
import { Loading, PageHead, Switch, TagInput, friendly, useLoad } from "@/components/admin/ui";
import { useToast } from "@/components/Toast";
import { seedProjects, type Project } from "@/content/projects";
import { Plus } from "@/components/icons";

const CATS = ["BA", "AI", "DỮ LIỆU", "NGÔN NGỮ"] as const;

const blank = (order: number): Project => ({
  ...seedProjects[0],
  slug: "",
  title: "",
  summary: "",
  lead: "",
  kind: "",
  img: "[ẢNH DỰ ÁN]",
  chips: [],
  featured: false,
  status: "draft",
  year: new Date().getFullYear(),
  order,
});

/** Editable list of strings (one input per line). */
function Lines({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  return (
    <div className="flex flex-col gap-2">
      {value.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input className="field" value={v} placeholder={placeholder} onChange={(e) => onChange(value.map((x, k) => (k === i ? e.target.value : x)))} />
          <button type="button" aria-label="Xoá dòng" onClick={() => onChange(value.filter((_, k) => k !== i))} className="h-11 w-11 shrink-0 cursor-pointer rounded-[10px] border border-line bg-white">×</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, ""])} className="self-start rounded-full border border-dashed border-[#BDBDBD] bg-white px-3 py-1.5 text-[13px]">+ Thêm dòng</button>
    </div>
  );
}

export default function AdminProjects() {
  const { data, error, reload, setData } = useLoad(() => cms.projects.list());
  const [edit, setEdit] = useState<(Project & { id?: string }) | null>(null);
  const [tab, setTab] = useState<"info" | "content" | "docs">("info");
  const [busy, setBusy] = useState(false);
  const { flash, node } = useToast();

  const sorted = (data ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  useEffect(() => {
    if (data && new URLSearchParams(location.search).get("new")) setEdit(blank(data.length));
  }, [data]);

  const set = (p: Partial<Project>) => edit && setEdit({ ...edit, ...p });
  const setMeta = (p: Partial<Project["meta"]>) => edit && setEdit({ ...edit, meta: { ...edit.meta, ...p } });
  const setStory = (p: Partial<Project["story"]>) => edit && setEdit({ ...edit, story: { ...edit.story, ...p } });

  const save = async () => {
    if (!edit) return;
    if (!edit.title.trim()) return flash("Cần tên dự án.");
    const featuredOthers = sorted.filter((p) => p.featured && p.id !== edit.id).length;
    if (edit.featured && featuredOthers >= 3) return flash("Tối đa 3 dự án nổi bật. Tắt bớt một dự án khác trước.");
    const slug = slugify(edit.slug || edit.title);
    if (sorted.some((p) => p.slug === slug && p.id !== edit.id)) return flash("Đường dẫn đã được dùng cho dự án khác.");
    setBusy(true);
    try {
      const { id, ...rest } = edit;
      const newId = await cms.projects.save(id, { ...rest, slug, chips: rest.chips.length ? rest.chips : rest.meta.tools.slice(0, 3) });
      const saved = { ...rest, slug, id: newId } as WithId<Project>;
      setData([...(data ?? []).filter((p) => p.id !== newId), saved]);
      setEdit(null);
      flash("Đã lưu dự án — site sẽ cập nhật trong ~15 phút");
    } catch (e) {
      flash(friendly(e));
    } finally {
      setBusy(false);
    }
  };

  const move = async (i: number, dir: -1 | 1) => {
    const arr = sorted.slice();
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setData(arr.map((p, k) => ({ ...p, order: k })));
    try {
      await cms.projects.reorder(arr.map((p) => p.id));
    } catch (e) {
      flash(friendly(e));
    }
  };

  return (
    <div className="mx-auto max-w-[1160px]">
      <PageHead
        title="Dự án"
        sub="Mỗi dự án theo khung case study: Bối cảnh → Vấn đề → Quy trình → Kết quả."
        action={<button type="button" onClick={() => { setEdit(blank(sorted.length)); setTab("info"); }} className="btn btn-dark h-12 text-sm"><Plus /> Thêm dự án</button>}
      />
      {!data ? (
        <Loading error={error} onRetry={reload} />
      ) : (
        <div className="flex flex-wrap items-start gap-5">
          <div className="card min-w-0 flex-[1_1_480px]">
            <div className="flex justify-between border-b border-line px-4 py-3 text-sm text-muted">
              <span>{sorted.length} dự án · {sorted.filter((p) => p.featured).length} nổi bật trên Trang chủ</span>
              <span className="font-mono text-[11px]">↑↓ ĐỂ SẮP XẾP</span>
            </div>
            <ul className="m-0 flex list-none flex-col gap-1 p-2">
              {sorted.map((p, i) => (
                <li key={p.id} className={`flex items-center gap-3 rounded-xl p-2.5 ${edit?.id === p.id ? "ring-1 ring-ink" : "hover:bg-[#FAFAFA]"}`}>
                  <span className="flex flex-col">
                    <button type="button" aria-label="Lên" onClick={() => move(i, -1)} className="h-6 w-7 cursor-pointer border-0 bg-transparent text-muted">↑</button>
                    <button type="button" aria-label="Xuống" onClick={() => move(i, 1)} className="h-6 w-7 cursor-pointer border-0 bg-transparent text-muted">↓</button>
                  </span>
                  <button type="button" onClick={() => { setEdit({ ...p }); setTab("info"); }} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left">
                    <span className={`h-12 w-16 flex-none rounded-lg ${p.featured ? "bg-panel" : "bg-soft"}`} />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[16px] font-semibold">{p.title || "(Chưa đặt tên)"}</span>
                      <span className="truncate font-mono text-[11px] text-muted">{p.cat} · {p.kind} · {p.year}</span>
                    </span>
                  </button>
                  {p.featured && <span className="tag max-sm:hidden">NỔI BẬT</span>}
                  <span className="w-24 text-right text-[13px] text-muted">{(p.status ?? "published") === "published" ? "Đã xuất bản" : "Bản nháp"}</span>
                </li>
              ))}
            </ul>
          </div>

          {edit && (
            <div className="card sticky top-20 flex max-h-[calc(100vh-100px)] min-w-0 flex-[1_1_440px] flex-col overflow-hidden">
              <div className="flex items-start justify-between gap-3 px-5 pt-5">
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] tracking-[0.08em] text-muted">{edit.id ? "SỬA" : "THÊM"} DỰ ÁN · {edit.cat}</span>
                  <span className="text-xl font-semibold">{edit.title || "Dự án mới"}</span>
                </div>
                <div className="flex gap-1">
                  {edit.id && (edit.status ?? "published") === "published" && <a href={`/du-an/${edit.slug}/`} target="_blank" className="flex h-10 items-center rounded-lg px-2 text-sm no-underline hover:bg-soft">Xem</a>}
                  <button type="button" aria-label="Đóng" onClick={() => setEdit(null)} className="h-10 w-10 cursor-pointer rounded-lg border-0 bg-transparent text-xl hover:bg-soft">×</button>
                </div>
              </div>
              <div role="tablist" className="flex gap-1 border-b border-line px-3">
                {(
                  [
                    ["info", "Thông tin"],
                    ["content", "Nội dung"],
                    ["docs", "Tài liệu BA"],
                  ] as const
                ).map(([k, l]) => (
                  <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`h-12 cursor-pointer border-0 border-b-2 bg-transparent px-3 text-[15px] ${tab === k ? "border-ink font-semibold" : "border-transparent text-muted"}`}>{l}</button>
                ))}
              </div>
              <div className="flex flex-col gap-3.5 overflow-y-auto p-5">
                {tab === "info" && (
                  <>
                    <label className="flabel">Tên dự án<input className="field" value={edit.title} onChange={(e) => set({ title: e.target.value, slug: edit.id ? edit.slug : slugify(e.target.value) })} /></label>
                    <label className="flabel">Tóm tắt (thẻ dự án)<input className="field" value={edit.summary} placeholder="[Vấn đề] → [Kết quả đo được]" onChange={(e) => set({ summary: e.target.value })} /></label>
                    <label className="flabel">Một câu giới thiệu (trang chi tiết)<textarea className="field" rows={2} value={edit.lead} onChange={(e) => set({ lead: e.target.value })} /></label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flabel">Chủ đề<select className="select" value={edit.cat} onChange={(e) => set({ cat: e.target.value as Project["cat"] })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
                      <label className="flabel">Năm<input className="field" type="number" value={edit.year} onChange={(e) => set({ year: Number(e.target.value) })} /></label>
                      <label className="flabel">Loại dự án<input className="field" value={edit.kind} placeholder="VD: TÍNH NĂNG AI" onChange={(e) => set({ kind: e.target.value.toUpperCase() })} /></label>
                      <label className="flabel">Đường dẫn<input className="field font-mono text-[13px]" value={edit.slug} onChange={(e) => set({ slug: slugify(e.target.value) })} /></label>
                      <label className="flabel">Vai trò<input className="field" value={edit.meta.role} onChange={(e) => setMeta({ role: e.target.value })} /></label>
                      <label className="flabel">Thời gian<input className="field" value={edit.meta.duration} placeholder="VD: 4 tháng" onChange={(e) => setMeta({ duration: e.target.value })} /></label>
                      <label className="flabel">Nhóm<input className="field" value={edit.meta.team} onChange={(e) => setMeta({ team: e.target.value })} /></label>
                      <label className="flabel">Lĩnh vực<input className="field" value={edit.meta.domain} onChange={(e) => setMeta({ domain: e.target.value })} /></label>
                    </div>
                    <div className="flabel">Công cụ<TagInput value={edit.meta.tools} onChange={(tools) => setMeta({ tools })} placeholder="VD: Jira" /></div>
                    <div className="flabel">Từ khoá trên thẻ (tối đa 3)<TagInput value={edit.chips} onChange={(chips) => set({ chips: chips.slice(0, 3) })} placeholder="VD: User story" /></div>
                    <div className="flabel">Kết quả chính (3 ô số)
                      {edit.results.map((r, i) => (
                        <div key={i} className="flex gap-2">
                          <input className="field w-28 flex-none" value={r.value} placeholder="+30%" onChange={(e) => set({ results: edit.results.map((x, k) => (k === i ? { ...x, value: e.target.value } : x)) })} />
                          <input className="field" value={r.label} placeholder={`Mô tả chỉ số ${i + 1}`} onChange={(e) => set({ results: edit.results.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)) })} />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-soft p-4">
                      <span className="flex flex-col"><span className="font-semibold">Nổi bật trên Trang chủ</span><span className="text-[13px] text-muted">Tối đa 3 dự án</span></span>
                      <Switch checked={!!edit.featured} onChange={(featured) => set({ featured })} label="Nổi bật trên Trang chủ" />
                    </div>
                  </>
                )}
                {tab === "content" && (
                  <>
                    <label className="flabel">01 · Bối cảnh<textarea className="field" rows={4} value={edit.context} onChange={(e) => set({ context: e.target.value })} /></label>
                    <div className="flabel">02 · Vấn đề<Lines value={edit.problems} onChange={(problems) => set({ problems })} placeholder="Pain point" /></div>
                    <div className="flabel">05 · User story mẫu
                      <div className="grid grid-cols-2 gap-2">
                        <input className="field" value={edit.story.id} placeholder="US-01" onChange={(e) => setStory({ id: e.target.value })} />
                        <input className="field" value={edit.story.epic} placeholder="Tên epic" onChange={(e) => setStory({ epic: e.target.value })} />
                      </div>
                      <input className="field" value={edit.story.role} placeholder="Là [vai trò]" onChange={(e) => setStory({ role: e.target.value })} />
                      <input className="field" value={edit.story.action} placeholder="tôi muốn [hành động]" onChange={(e) => setStory({ action: e.target.value })} />
                      <input className="field" value={edit.story.value} placeholder="để [giá trị]" onChange={(e) => setStory({ value: e.target.value })} />
                      <input className="field" value={edit.story.given} placeholder="CHO TRƯỚC…" onChange={(e) => setStory({ given: e.target.value })} />
                      <input className="field" value={edit.story.when} placeholder="KHI…" onChange={(e) => setStory({ when: e.target.value })} />
                      <input className="field" value={edit.story.then} placeholder="THÌ…" onChange={(e) => setStory({ then: e.target.value })} />
                    </div>
                    <div className="flabel">06 · Đã đạt được<Lines value={edit.outcomes} onChange={(outcomes) => set({ outcomes })} placeholder="Kết quả" /></div>
                    <div className="flabel">06 · Nếu làm lại<Lines value={edit.lessons} onChange={(lessons) => set({ lessons })} placeholder="Bài học" /></div>
                  </>
                )}
                {tab === "docs" && (
                  <>
                    <p className="m-0 text-sm text-muted">Mục 04 trên trang chi tiết. Ảnh thật sẽ thêm khi có thư viện media.</p>
                    {edit.docs.map((d, i) => (
                      <div key={i} className="flex flex-col gap-2 rounded-xl border border-line p-3">
                        <div className="flex gap-2">
                          <input className="field" value={d.name} placeholder="Tên tài liệu (VD: BRD)" onChange={(e) => set({ docs: edit.docs.map((x, k) => (k === i ? { ...x, name: e.target.value, img: e.target.value.toUpperCase() } : x)) })} />
                          <button type="button" aria-label="Xoá tài liệu" onClick={() => set({ docs: edit.docs.filter((_, k) => k !== i) })} className="h-11 w-11 shrink-0 cursor-pointer rounded-[10px] border border-line bg-white">×</button>
                        </div>
                        <input className="field" value={d.caption} placeholder="Chú thích" onChange={(e) => set({ docs: edit.docs.map((x, k) => (k === i ? { ...x, caption: e.target.value } : x)) })} />
                      </div>
                    ))}
                    <button type="button" onClick={() => set({ docs: [...edit.docs, { name: "", img: "", caption: "" }] })} className="self-start rounded-full border border-dashed border-[#BDBDBD] bg-white px-3 py-1.5 text-[13px]">+ Thêm tài liệu</button>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4">
                <label className="flex items-center gap-2 text-sm text-muted">Trạng thái
                  <select className="select" value={edit.status ?? "published"} onChange={(e) => set({ status: e.target.value as Project["status"] })}>
                    <option value="published">Đã xuất bản</option>
                    <option value="draft">Bản nháp</option>
                  </select>
                </label>
                <div className="flex gap-2">
                  {edit.id && (
                    <button
                      type="button"
                      className="h-11 cursor-pointer rounded-full border-0 bg-transparent px-3 text-sm text-muted"
                      onClick={async () => {
                        if (!confirm(`Xoá dự án “${edit.title}”?`)) return;
                        await cms.projects.remove(edit.id!, edit.title);
                        setData((data ?? []).filter((p) => p.id !== edit.id));
                        setEdit(null);
                      }}
                    >
                      Xoá
                    </button>
                  )}
                  <button type="button" onClick={() => setEdit(null)} className="btn btn-sm h-11 border-0 text-sm">Huỷ</button>
                  <button type="button" disabled={busy} onClick={save} className="btn btn-dark btn-sm h-11 text-sm">Lưu thay đổi</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {node}
    </div>
  );
}
