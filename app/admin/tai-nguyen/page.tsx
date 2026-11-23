"use client";

import { useState } from "react";
import { cms } from "@/lib/cms";
import { Loading, PageHead, friendly, useLoad } from "@/components/admin/ui";
import { useToast } from "@/components/Toast";
import { topics, type Resource } from "@/content/resources";
import { Plus } from "@/components/icons";

type St = "approved" | "pending" | "rejected";
const blank = (): Resource => ({ id: "", cat: "AI", title: "", url: "https://", desc: "", by: "Thương", likes: 0, status: "approved" });

export default function AdminResources() {
  const { data, error, reload, setData } = useLoad(() => cms.resources.list());
  const [tab, setTab] = useState<St>("approved");
  const [edit, setEdit] = useState<Resource | null>(null);
  const { flash, node } = useToast();

  const rows = (data ?? []).filter((r) => (r.status ?? "approved") === tab).sort((a, b) => b.likes - a.likes);
  const count = (s: St) => (data ?? []).filter((r) => (r.status ?? "approved") === s).length;

  const persist = async (r: Resource & { id: string | number }, msg: string) => {
    try {
      const { id, ...rest } = r;
      const docId = typeof id === "string" && id ? id : undefined;
      const newId = await cms.resources.save(docId, { ...rest, id: 0 } as Resource);
      setData([...(data ?? []).filter((x) => x.id !== newId), { ...rest, id: newId } as Resource & { id: string }]);
      flash(msg);
    } catch (e) {
      flash(friendly(e));
    }
  };

  return (
    <div className="mx-auto max-w-[1160px]">
      <PageHead
        title="Tài nguyên"
        sub="Duyệt tài liệu và quản lý trang Kết nối."
        action={<button type="button" onClick={() => setEdit(blank())} className="btn btn-dark h-12 text-sm"><Plus /> Thêm tài nguyên</button>}
      />
      {!data ? (
        <Loading error={error} onRetry={reload} />
      ) : (
        <div className="flex flex-wrap items-start gap-5">
          <div className="card min-w-0 flex-[1_1_600px] overflow-hidden">
            <div role="tablist" className="flex gap-1 border-b border-line px-3">
              {(
                [
                  ["approved", "Đã duyệt"],
                  ["pending", "Chờ duyệt"],
                  ["rejected", "Đã từ chối"],
                ] as const
              ).map(([id, l]) => (
                <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`flex h-[52px] cursor-pointer items-center gap-2 border-0 border-b-2 bg-transparent px-3 text-[15px] ${tab === id ? "border-ink font-semibold" : "border-transparent text-muted"}`}>
                  {l}<span className={`rounded-full px-1.5 font-mono text-[11px] ${tab === id ? "bg-ink text-white" : "bg-soft"}`}>{count(id)}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3 p-4">
              {rows.length === 0 && <p className="m-0 p-8 text-center text-muted">Không có tài nguyên nào ở đây.</p>}
              {rows.map((r) => (
                <div key={r.id} className="flex flex-col gap-3 rounded-[14px] border border-line p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] text-muted"><b className="text-ink">{r.by}</b> · {topics[r.cat] ?? r.cat} · ♥ {r.likes}</span>
                    <a href={r.url} target="_blank" rel="noopener nofollow" className="text-[17px] font-semibold no-underline">{r.title} ↗</a>
                    <span className="truncate font-mono text-xs text-muted">{r.url}</span>
                    <span className="text-sm text-muted">{r.desc}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line pt-3">
                    <button type="button" className="h-10 cursor-pointer rounded-full border-0 bg-transparent px-3 text-sm text-muted" onClick={async () => { if (!confirm(`Xoá “${r.title}”?`)) return; await cms.resources.remove(String(r.id), r.title); setData((data ?? []).filter((x) => x.id !== r.id)); }}>Xoá</button>
                    <button type="button" className="btn btn-sm h-10 text-sm" onClick={() => setEdit({ ...r })}>Sửa</button>
                    {tab !== "rejected" && <button type="button" className="btn btn-sm h-10 text-sm" onClick={() => persist({ ...r, status: "rejected" }, "Đã từ chối")}>Từ chối</button>}
                    {tab !== "approved" && <button type="button" className="btn btn-dark btn-sm h-10 text-sm" onClick={() => persist({ ...r, status: "approved" }, "Đã duyệt & hiển thị")}>Duyệt &amp; hiển thị</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-[1_1_300px] flex-col gap-4">
            {edit && (
              <div className="card flex flex-col gap-3 p-5">
                <h2 className="m-0 text-[17px] font-semibold">{edit.id ? "Sửa tài nguyên" : "Thêm tài nguyên"}</h2>
                <label className="flabel">Tiêu đề<input className="field" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></label>
                <label className="flabel">Đường dẫn<input className="field font-mono text-[13px]" value={edit.url} onChange={(e) => setEdit({ ...edit, url: e.target.value })} /></label>
                <label className="flabel">Mô tả<textarea className="field" rows={3} value={edit.desc} onChange={(e) => setEdit({ ...edit, desc: e.target.value })} /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flabel">Chủ đề<select className="select" value={edit.cat} onChange={(e) => setEdit({ ...edit, cat: e.target.value })}>{Object.entries(topics).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
                  <label className="flabel">Người chia sẻ<input className="field" value={edit.by} onChange={(e) => setEdit({ ...edit, by: e.target.value })} /></label>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" className="btn btn-sm h-11 border-0 text-sm" onClick={() => setEdit(null)}>Huỷ</button>
                  <button
                    type="button"
                    className="btn btn-dark btn-sm h-11 text-sm"
                    onClick={async () => {
                      if (!edit.title.trim() || !/^https?:\/\//.test(edit.url)) return flash("Cần tiêu đề và đường dẫn bắt đầu bằng https://");
                      await persist(edit as Resource & { id: string }, "Đã lưu tài nguyên");
                      setEdit(null);
                    }}
                  >
                    Lưu
                  </button>
                </div>
              </div>
            )}
            <div className="card flex flex-col gap-2 p-5">
              <h2 className="m-0 text-[17px] font-semibold">Chủ đề</h2>
              {Object.entries(topics).map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 text-[15px]"><span>{v}</span><span className="font-mono text-xs text-muted">{(data ?? []).filter((r) => r.cat === k && (r.status ?? "approved") === "approved").length}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}
      {node}
    </div>
  );
}
