"use client";

import { useState } from "react";
import { topics } from "@/content/resources";
import { authMessage, useAccount } from "@/lib/account";
import { Dialog } from "./SignInDialog";

const empty = { title: "", url: "https://", desc: "", cat: "BA" };

export default function ShareResourceDialog({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const { submitResource } = useAccount();
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(f.url.trim())) return setErr("Link cần bắt đầu bằng http:// hoặc https://");
    setBusy(true);
    setErr(null);
    try {
      await submitResource(f);
      setF(empty);
      onDone();
    } catch (e) {
      setErr(authMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} label="Chia sẻ tài liệu">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="m-0 font-serif text-4xl font-medium leading-tight">Chia sẻ tài liệu</h2>
          <p className="m-0 text-base leading-relaxed text-muted">Tài liệu sẽ hiện trên trang sau khi Thương duyệt.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Đóng" className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border-0 bg-soft text-lg">×</button>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <label className="flabel">Tên tài liệu<input className="field" required maxLength={200} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></label>
        <label className="flabel">Link<input className="field" type="url" required maxLength={500} value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} /></label>
        <label className="flabel">
          Chủ đề
          <select className="field" value={f.cat} onChange={(e) => setF({ ...f, cat: e.target.value })}>
            {Object.entries(topics).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label className="flabel">Vì sao tài liệu này hữu ích?<textarea className="field" rows={3} maxLength={500} value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} /></label>
        {err && <p role="alert" className="m-0 text-sm text-[#B42318]">{err}</p>}
        <button type="submit" disabled={busy} className="btn btn-dark w-full">{busy ? "Đang gửi…" : "Gửi để duyệt"}</button>
      </form>
    </Dialog>
  );
}
