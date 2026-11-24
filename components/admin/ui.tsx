"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 font-serif text-[clamp(38px,4vw,48px)] leading-none font-medium">{title}</h1>
        {sub && <p className="m-0 text-base text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status?: string }) {
  const pub = status === "published" || status === "approved";
  const label = { published: "Đã xuất bản", draft: "Bản nháp", approved: "Đã duyệt", pending: "Chờ duyệt", rejected: "Đã từ chối" }[status ?? "draft"] ?? status;
  return (
    <span className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium whitespace-nowrap ${pub ? "bg-ink text-white" : "border border-line-strong bg-white"}`}>
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${pub ? "bg-white" : "border border-ink"}`} />
      {label}
    </span>
  );
}

export function useLoad<T>(fn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(() => {
    setError(null);
    fn()
      .then(setData)
      .catch((e) => setError(friendly(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(reload, [reload]);
  return { data, error, reload, setData };
}

export function friendly(e: unknown) {
  const code = (e as { code?: string }).code ?? "";
  if (code.includes("permission-denied")) return "Không có quyền (kiểm tra Firestore rules hoặc quyền admin).";
  if (code.includes("unavailable")) return "Mất kết nối tới Firestore. Thử lại sau.";
  if (code.includes("not-found") || code.includes("failed-precondition")) return "Chưa có Firestore Database — tạo database trong Firebase console.";
  return (e as Error)?.message || "Có lỗi xảy ra.";
}

export function Loading({ error, onRetry }: { error?: string | null; onRetry?: () => void }) {
  if (error)
    return (
      <div className="card flex flex-col items-start gap-3 p-6">
        <span className="font-medium">{error}</span>
        {onRetry && <button type="button" className="btn btn-sm" onClick={onRetry}>Thử lại</button>}
      </div>
    );
  return <div className="py-16 text-center font-mono text-xs text-muted">ĐANG TẢI…</div>;
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-[52px] flex-none cursor-pointer rounded-full border-0 transition-colors ${checked ? "bg-ink" : "bg-[#D4D4D4]"}`}
    >
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${checked ? "left-[24px]" : "left-1"}`} />
    </button>
  );
}

export function TagInput({ value, onChange, placeholder = "Thêm…", upper = false }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; upper?: boolean }) {
  const [t, setT] = useState("");
  const add = () => {
    const v = (upper ? t.toUpperCase() : t).trim().replace(/^#/, "");
    if (v && !value.includes(v)) onChange([...value, v]);
    setT("");
  };
  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((x) => (
            <span key={x} className="inline-flex items-center gap-1.5 rounded-md bg-soft py-1 pr-1 pl-2.5 font-mono text-xs">
              {upper ? "#" : ""}{x}
              <button type="button" aria-label={`Xoá ${x}`} onClick={() => onChange(value.filter((y) => y !== x))} className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          className="field"
          value={t}
          placeholder={placeholder}
          onChange={(e) => setT(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" onClick={add} className="btn btn-dark h-11 shrink-0 rounded-[10px] px-4 text-sm">Thêm</button>
      </div>
    </div>
  );
}

export const fmtDate = (ms?: number) => {
  if (!ms) return "—";
  const d = new Date(ms);
  const today = new Date();
  const hm = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === today.toDateString()) return `Hôm nay, ${hm}`;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};
