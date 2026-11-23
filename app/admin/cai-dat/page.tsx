"use client";

import { useEffect, useState } from "react";
import { cms } from "@/lib/cms";
import { Loading, PageHead, friendly } from "@/components/admin/ui";
import { useToast } from "@/components/Toast";
import { seedSite, type Site } from "@/content/site";

export default function AdminSettings() {
  const [s, setS] = useState<Site | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"profile" | "contact" | "now">("profile");
  const [busy, setBusy] = useState(false);
  const { flash, node } = useToast();

  useEffect(() => {
    cms.settings
      .get()
      .then((r) => setS({ ...seedSite, ...(r ?? {}), social: { ...seedSite.social, ...(r?.social ?? {}) }, now: r?.now ?? seedSite.now }))
      .catch((e) => setError(friendly(e)));
  }, []);

  if (!s) return <Loading error={error} />;
  const set = (p: Partial<Site>) => setS({ ...s, ...p });

  return (
    <div className="mx-auto max-w-[1160px]">
      <PageHead title="Cài đặt" sub="Hồ sơ, liên hệ và hàng “Hiện tại” trên Trang chủ." />
      <div className="flex flex-wrap items-start gap-5">
        <nav className="flex flex-[0_0_220px] flex-col gap-1 max-md:flex-auto max-md:flex-row max-md:overflow-x-auto">
          {(
            [
              ["profile", "Hồ sơ"],
              ["contact", "Liên hệ & mạng xã hội"],
              ["now", "Hàng “Hiện tại”"],
            ] as const
          ).map(([k, l]) => (
            <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)} className={`h-11 shrink-0 cursor-pointer rounded-[10px] border-0 px-4 text-left text-[15px] ${tab === k ? "bg-[#EAEAEA] font-medium" : "bg-transparent"}`}>{l}</button>
          ))}
        </nav>
        <div className="card flex min-w-0 flex-[1_1_560px] flex-col gap-4 p-6">
          {tab === "profile" && (
            <>
              <h2 className="m-0 text-lg font-semibold">Hồ sơ</h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
                <label className="flabel">Tên hiển thị<input className="field" value={s.author} onChange={(e) => set({ author: e.target.value })} /></label>
                <label className="flabel">Vai trò<input className="field" value={s.role} onChange={(e) => set({ role: e.target.value })} /></label>
              </div>
              <label className="flabel">Giới thiệu ngắn (hiện ở hộp tác giả)<textarea className="field" rows={3} value={s.bio ?? ""} onChange={(e) => set({ bio: e.target.value })} /></label>
              <label className="flabel">Câu cuối trang (footer)<input className="field" value={s.tagline} onChange={(e) => set({ tagline: e.target.value })} /></label>
            </>
          )}
          {tab === "contact" && (
            <>
              <h2 className="m-0 text-lg font-semibold">Liên hệ &amp; mạng xã hội</h2>
              <label className="flabel">Email liên hệ (hiện trên site)<input className="field" value={s.email} onChange={(e) => set({ email: e.target.value })} /></label>
              <label className="flabel">Link CV (Google Drive, PDF…)<input className="field" value={s.cvUrl} onChange={(e) => set({ cvUrl: e.target.value })} /></label>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
                {(["linkedin", "github", "youtube", "xiaohongshu"] as const).map((k) => (
                  <label key={k} className="flabel capitalize">{k}<input className="field" value={s.social[k]} placeholder="https://" onChange={(e) => set({ social: { ...s.social, [k]: e.target.value } })} /></label>
                ))}
              </div>
            </>
          )}
          {tab === "now" && (
            <>
              <h2 className="m-0 text-lg font-semibold">Hàng “Hiện tại” trên Trang chủ</h2>
              {s.now.map((n, i) => (
                <div key={i} className="grid grid-cols-[160px_1fr] gap-2 max-sm:grid-cols-1">
                  <input className="field font-mono text-[13px]" value={n.label} onChange={(e) => set({ now: s.now.map((x, k) => (k === i ? { ...x, label: e.target.value.toUpperCase() } : x)) })} />
                  <input className="field" value={n.value} onChange={(e) => set({ now: s.now.map((x, k) => (k === i ? { ...x, value: e.target.value } : x)) })} />
                </div>
              ))}
            </>
          )}
          <div className="flex justify-end border-t border-line pt-4">
            <button
              type="button"
              disabled={busy}
              className="btn btn-dark btn-sm h-11 text-sm"
              onClick={async () => {
                setBusy(true);
                try {
                  const { author, role, bio, tagline, email, cvUrl, social, now } = s;
                  await cms.settings.save({ author, role, bio, tagline, email, cvUrl, social, now });
                  flash("Đã lưu — site sẽ cập nhật trong ~15 phút");
                } catch (e) {
                  flash(friendly(e));
                } finally {
                  setBusy(false);
                }
              }}
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
      {node}
    </div>
  );
}
