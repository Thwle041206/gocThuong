"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAccount } from "@/lib/account";
import { User } from "../icons";

export default function AccountButton() {
  const { ready, enabled, user, openSignIn, signOut } = useAccount();
  const [menu, setMenu] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [menu]);

  const base = "inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border-0 bg-ink";
  if (!ready || !enabled || !user)
    return (
      <button
        type="button"
        aria-label="Đăng nhập"
        title={enabled ? "Đăng nhập để lưu bài viết và tài liệu" : "Đăng nhập chưa sẵn sàng"}
        disabled={!ready || !enabled}
        onClick={() => openSignIn()}
        className={`${base} disabled:opacity-60`}
      >
        <User />
      </button>
    );

  const initial = (user.displayName || user.email || "?").trim().charAt(0).toUpperCase();
  return (
    <div ref={box} className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={menu} aria-label="Tài khoản của bạn" onClick={() => setMenu((m) => !m)} className={`${base} overflow-hidden font-serif text-[22px] text-white`}>
        {user.photoURL ? <img src={user.photoURL} alt="" width={48} height={48} referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : initial}
      </button>
      {menu && (
        <div role="menu" className="absolute right-0 top-[56px] z-40 flex w-60 flex-col rounded-xl border border-line bg-white p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
          <div className="flex flex-col px-3 py-2.5">
            <span className="truncate text-sm font-semibold">{user.displayName || "Bạn đọc"}</span>
            <span className="truncate text-xs text-muted">{user.email}</span>
          </div>
          <Link role="menuitem" href="/tai-khoan/" onClick={() => setMenu(false)} className="toc-link !text-ink">Tài khoản của tôi</Link>
          <Link role="menuitem" href="/tai-khoan/#da-luu" onClick={() => setMenu(false)} className="toc-link !text-ink">Đã lưu</Link>
          <button role="menuitem" type="button" onClick={() => { setMenu(false); signOut(); }} className="toc-link cursor-pointer border-0 bg-transparent text-left font-[inherit]">Đăng xuất</button>
        </div>
      )}
    </div>
  );
}
