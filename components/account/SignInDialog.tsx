"use client";

import { useEffect, useRef, useState } from "react";
import { authMessage, resetPassword, signInWithEmail, signInWithGoogle, signUpWithEmail, useAccount } from "@/lib/account";

type Mode = "in" | "up" | "reset";

export function Dialog({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(440px,calc(100vw-32px))] rounded-2xl border-0 p-0 text-ink shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop:bg-black/40"
    >
      {open && <div className="flex flex-col gap-5 p-7">{children}</div>}
    </dialog>
  );
}

export default function SignInDialog() {
  const { signInReason, closeSignIn, user } = useAccount();
  const open = signInReason !== null && !user;
  const [mode, setMode] = useState<Mode>("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setErr(null);
      setInfo(null);
    }
  }, [open]);

  const run = async (fn: () => Promise<void>, done?: string) => {
    setBusy(true);
    setErr(null);
    setInfo(null);
    try {
      await fn();
      if (done) setInfo(done);
    } catch (e) {
      setErr(authMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "reset") return run(() => resetPassword(email), "Đã gửi email đặt lại mật khẩu. Kiểm tra hộp thư của bạn.");
    if (mode === "up") return run(() => signUpWithEmail(name, email, pw));
    return run(() => signInWithEmail(email, pw));
  };

  const title = mode === "up" ? "Tạo tài khoản" : mode === "reset" ? "Quên mật khẩu" : "Đăng nhập";

  return (
    <Dialog open={open} onClose={closeSignIn} label={title}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="m-0 font-serif text-3xl sm:text-4xl font-medium leading-tight">{title}</h2>
          <p className="m-0 text-base leading-relaxed text-muted">{signInReason}</p>
        </div>
        <button type="button" onClick={closeSignIn} aria-label="Đóng" className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border-0 bg-soft text-lg">×</button>
      </div>

      {mode !== "reset" && (
        <>
          <button type="button" disabled={busy} onClick={() => run(signInWithGoogle)} className="btn w-full border-line-strong">
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
            Tiếp tục với Google
          </button>
          <div className="flex items-center gap-3 font-mono text-xs tracking-[0.1em] text-muted">
            <span className="h-px flex-1 bg-line" />HOẶC DÙNG EMAIL<span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      <form onSubmit={submit} className="flex flex-col gap-3.5">
        {mode === "up" && (
          <label className="flabel">Tên hiển thị<input className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={60} /></label>
        )}
        <label className="flabel">Email<input className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
        {mode !== "reset" && (
          <label className="flabel">
            Mật khẩu
            <input className="field" type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={mode === "up" ? "new-password" : "current-password"} />
          </label>
        )}
        {err && <p role="alert" className="m-0 text-sm text-[#B42318]">{err}</p>}
        {info && <p role="status" className="m-0 text-sm">{info}</p>}
        <button type="submit" disabled={busy} className="btn btn-dark w-full">
          {busy ? "Đang xử lý…" : mode === "up" ? "Tạo tài khoản" : mode === "reset" ? "Gửi email đặt lại" : "Đăng nhập"}
        </button>
      </form>

      <div className="flex flex-wrap justify-between gap-2 text-sm">
        {mode === "in" ? (
          <>
            <button type="button" className="cursor-pointer border-0 bg-transparent p-0 text-ink underline" onClick={() => setMode("up")}>Chưa có tài khoản? Tạo mới</button>
            <button type="button" className="cursor-pointer border-0 bg-transparent p-0 text-muted underline" onClick={() => setMode("reset")}>Quên mật khẩu</button>
          </>
        ) : (
          <button type="button" className="cursor-pointer border-0 bg-transparent p-0 text-ink underline" onClick={() => setMode("in")}>← Quay lại đăng nhập</button>
        )}
      </div>
      <p className="m-0 text-xs leading-relaxed text-muted">Tài khoản chỉ dùng để lưu bài viết, tài liệu và gửi chia sẻ. Bạn có thể xoá tài khoản bất cứ lúc nào trong trang Tài khoản.</p>
    </Dialog>
  );
}
