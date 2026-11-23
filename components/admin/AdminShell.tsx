"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  GoogleAuthProvider,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { fb, firebaseReady } from "@/lib/firebase";
import { Plus } from "../icons";

type Ctx = { user: User; isAdmin: boolean };
const AdminCtx = createContext<Ctx | null>(null);
export const useAdmin = () => useContext(AdminCtx)!;

const REPO_ACTIONS = "https://github.com/lletthuong061204-source/gocthuong-web/actions/workflows/deploy.yml";

const nav = [
  { href: "/admin/", label: "Tổng quan", icon: "grid", match: (p: string) => p === "/admin" || p === "/admin/" },
  { href: "/admin/bai-viet/", label: "Bài viết", icon: "doc", match: (p: string) => p.startsWith("/admin/bai-viet") },
  { href: "/admin/du-an/", label: "Dự án", icon: "case", match: (p: string) => p.startsWith("/admin/du-an") },
  { href: "/admin/tai-nguyen/", label: "Tài nguyên", icon: "link", match: (p: string) => p.startsWith("/admin/tai-nguyen") },
];
const nav2 = [{ href: "/admin/cai-dat/", label: "Cài đặt", icon: "gear", match: (p: string) => p.startsWith("/admin/cai-dat") }];

function Icon({ name }: { name: string }) {
  const p = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "grid") return <svg {...p}><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg>;
  if (name === "doc") return <svg {...p}><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M10 13h6M10 17h6" /></svg>;
  if (name === "case") return <svg {...p}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></svg>;
  if (name === "link") return <svg {...p}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>;
  return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" /></svg>;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<unknown>) => {
    setErr("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      const code = (e as { code?: string }).code ?? "";
      setErr(
        code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")
          ? "Email hoặc mật khẩu không đúng."
          : code.includes("operation-not-allowed")
            ? "Cách đăng nhập này chưa được bật trong Firebase Authentication."
            : code.includes("popup-closed")
              ? "Cửa sổ đăng nhập đã bị đóng."
              : `Không đăng nhập được (${code || "lỗi"}).`,
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
      <div className="card flex w-full max-w-[420px] flex-col gap-5 p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-ink font-serif text-[22px] font-semibold text-white">gT</span>
          <span className="text-lg font-semibold">góc Thương</span>
          <span className="rounded border border-ink px-1.5 font-mono text-[10px]">CMS</span>
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="m-0 font-serif text-[40px] font-medium">Đăng nhập</h1>
          <p className="m-0 text-sm text-muted">Chỉ tài khoản quản trị mới vào được.</p>
        </div>
        <button type="button" disabled={busy} onClick={() => run(() => signInWithPopup(fb().auth, new GoogleAuthProvider()))} className="btn btn-dark h-12 w-full">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
          Đăng nhập bằng Google
        </button>
        <div className="flex items-center gap-3 font-mono text-[11px] text-muted"><span className="h-px flex-1 bg-line" />HOẶC TÀI KHOẢN THỬ<span className="h-px flex-1 bg-line" /></div>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => signInWithEmailAndPassword(fb().auth, email.trim(), password));
          }}
        >
          <input className="field" type="email" autoComplete="username" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="field" type="password" autoComplete="current-password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" disabled={busy} className="btn h-12 w-full">Đăng nhập</button>
        </form>
        {err && <p role="alert" className="m-0 rounded-lg bg-soft px-3 py-2 text-sm">{err}</p>}
        <Link href="/" className="text-center text-sm text-muted">← Về trang chủ</Link>
      </div>
    </div>
  );
}

function NoAccess({ user }: { user: User }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
      <div className="card flex max-w-[480px] flex-col gap-4 p-8">
        <h1 className="m-0 font-serif text-[36px] font-medium">Chưa có quyền quản trị</h1>
        <p className="m-0 text-[15px] leading-relaxed text-muted">
          Bạn đã đăng nhập bằng <b className="text-ink">{user.email}</b>, nhưng tài khoản này chưa được cấp quyền. Nếu đây là email quản trị, hãy chạy lại{" "}
          <a href={REPO_ACTIONS} target="_blank" rel="noopener">workflow Deploy</a> (nó cấp quyền cho email trong secret <code>ADMIN_EMAILS</code>), rồi bấm “Thử lại”.
        </p>
        <div className="flex gap-2">
          <button type="button" className="btn btn-dark btn-sm" onClick={() => user.getIdToken(true).then(() => location.reload())}>Thử lại</button>
          <button type="button" className="btn btn-sm" onClick={() => signOut(fb().auth)}>Đăng xuất</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname() || "/admin";
  const [state, setState] = useState<{ loading: boolean; user: User | null; isAdmin: boolean }>({ loading: true, user: null, isAdmin: false });
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!firebaseReady) return setState({ loading: false, user: null, isAdmin: false });
    return onIdTokenChanged(fb().auth, async (u) => {
      if (!u) return setState({ loading: false, user: null, isAdmin: false });
      const t = await u.getIdTokenResult();
      setState({ loading: false, user: u, isAdmin: t.claims.role === "admin" });
    });
  }, []);

  if (!firebaseReady)
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="card max-w-[460px] p-8">
          <h1 className="m-0 font-serif text-[34px] font-medium">CMS chưa được kết nối</h1>
          <p className="text-[15px] text-muted">Cấu hình Firebase sẽ được thêm tự động khi site được deploy từ GitHub. Hãy mở trang này trên gocthuong.web.app.</p>
        </div>
      </div>
    );
  if (state.loading) return <div className="flex min-h-screen items-center justify-center font-mono text-xs text-muted">ĐANG TẢI…</div>;
  if (!state.user) return <Login />;
  if (!state.isAdmin) return <NoAccess user={state.user} />;

  const initial = (state.user.displayName || state.user.email || "T").trim()[0]!.toUpperCase();
  const link = (it: (typeof nav)[number]) => {
    const on = it.match(path);
    return (
      <Link key={it.href} href={it.href} className={`flex h-11 shrink-0 items-center gap-3 rounded-full px-4 text-[15px] no-underline ${on ? "bg-ink !text-white" : "hover:bg-soft"}`}>
        <Icon name={it.icon} /> {it.label}
      </Link>
    );
  };

  return (
    <AdminCtx.Provider value={{ user: state.user, isAdmin: state.isAdmin }}>
      <div className="min-h-screen bg-[#FAFAFA]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-white px-4 sm:px-5">
          <Link href="/admin/" className="flex items-center gap-2.5 no-underline">
            <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-ink font-serif text-xl font-semibold text-white">gT</span>
            <span className="text-[17px] font-semibold max-sm:hidden">góc Thương</span>
            <span className="rounded border border-ink px-1.5 font-mono text-[10px]">CMS</span>
          </Link>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" className="px-3 text-sm no-underline max-sm:hidden">Xem trang ↗</a>
            <Link href="/admin/bai-viet/sua/" className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium !text-white no-underline">
              <Plus /> <span className="max-sm:hidden">Viết bài mới</span>
            </Link>
            <div className="relative">
              <button type="button" aria-label="Tài khoản" aria-expanded={menu} onClick={() => setMenu(!menu)} className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-ink font-serif text-xl text-white">
                {initial}
              </button>
              {menu && (
                <div className="card absolute top-12 right-0 flex w-64 flex-col gap-1 p-2 shadow-lg">
                  <span className="truncate px-3 py-2 text-xs text-muted">{state.user.email}</span>
                  <a href={REPO_ACTIONS} target="_blank" rel="noopener" className="rounded-lg px-3 py-2 text-sm no-underline hover:bg-soft">Lịch sử deploy ↗</a>
                  <button type="button" onClick={() => signOut(fb().auth)} className="cursor-pointer rounded-lg border-0 bg-transparent px-3 py-2 text-left text-sm hover:bg-soft">Đăng xuất</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="flex max-md:flex-col">
          <aside className="flex shrink-0 gap-1 border-line bg-white p-3 md:sticky md:top-16 md:h-[calc(100vh-64px)] md:w-60 md:flex-col md:border-r max-md:overflow-x-auto max-md:border-b">
            {nav.map(link)}
            <span className="my-2 h-px bg-line max-md:hidden" />
            {nav2.map(link)}
            <span className="mt-auto px-3 pb-2 text-xs leading-relaxed text-muted max-md:hidden">Thay đổi lên site sau khi xuất bản (tối đa ~15 phút).</span>
          </aside>
          <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">{children}</main>
        </div>
      </div>
    </AdminCtx.Provider>
  );
}
