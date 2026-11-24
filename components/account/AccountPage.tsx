"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { topics } from "@/content/resources";
import { authMessage, type MySubmission, type SavedItem, useAccount } from "@/lib/account";
import { ArrowUpRight, Bookmark } from "../icons";
import { useToast } from "../Toast";
import ShareResourceDialog from "./ShareResourceDialog";

const STATUS: Record<MySubmission["status"], string> = { pending: "Chờ duyệt", approved: "Đã đăng", rejected: "Không đăng" };
const day = (ms?: number) => (ms ? new Date(ms).toLocaleDateString("vi-VN") : "");

export default function AccountPage() {
  const acc = useAccount();
  const { flash, node } = useToast();
  const [subs, setSubs] = useState<MySubmission[] | null>(null);
  const [sharing, setSharing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const uid = acc.user?.uid;
  const { mySubmissions } = acc;
  useEffect(() => {
    if (!uid) return setSubs(null);
    mySubmissions().then(setSubs, () => setSubs([]));
  }, [uid, mySubmissions]);

  const items = useMemo(() => Object.values(acc.saved).sort((a, b) => b.savedAt - a.savedAt), [acc.saved]);
  const posts = items.filter((i) => i.type === "post");
  const res = items.filter((i) => i.type === "resource");

  if (!acc.ready) return <section className="wrap py-24 text-muted">Đang tải…</section>;

  if (!acc.user)
    return (
      <section className="wrap flex flex-col items-start gap-5 py-24">
        <p className="eyebrow">● TÀI KHOẢN</p>
        <h1 className="display">Lưu những gì bạn thích</h1>
        <p className="m-0 max-w-[560px] text-lg text-muted">Đăng nhập để lưu bài viết, tài liệu và chia sẻ tài liệu hay với mọi người.</p>
        <button type="button" className="btn btn-dark" disabled={!acc.enabled} onClick={() => acc.openSignIn()}>
          {acc.enabled ? "Đăng nhập hoặc tạo tài khoản" : "Đăng nhập chưa sẵn sàng"}
        </button>
      </section>
    );

  const u = acc.user;
  const remove = async (i: SavedItem) => {
    try {
      await acc.toggleSave(i);
      flash("Đã bỏ lưu");
    } catch (e) {
      flash(authMessage(e));
    }
  };

  return (
    <>
      <section className="wrap flex flex-wrap items-end justify-between gap-6 pt-20">
        <div className="flex flex-col gap-3">
          <p className="eyebrow">● TÀI KHOẢN</p>
          <h1 className="display">Chào {u.displayName?.split(" ").slice(-1)[0] || "bạn"}</h1>
          <p className="m-0 text-muted">{u.email}</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button type="button" className="btn btn-dark btn-sm" onClick={() => setSharing(true)}>Chia sẻ tài liệu</button>
          <button type="button" className="btn btn-sm" onClick={() => acc.signOut()}>Đăng xuất</button>
        </div>
      </section>

      <section id="da-luu" aria-labelledby="h-saved" className="wrap flex scroll-mt-6 flex-col gap-8 pt-14">
        <h2 id="h-saved" className="h2-sm">Đã lưu</h2>
        {items.length === 0 && (
          <div className="empty">
            <span className="font-serif text-[28px]">Chưa lưu gì</span>
            <span className="text-[15px] text-muted">Bấm biểu tượng <Bookmark size={14} /> trên bài viết hoặc tài liệu để lưu vào đây.</span>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/bai-viet/" className="btn btn-sm">Xem bài viết</Link>
              <Link href="/ket-noi/" className="btn btn-sm">Xem tài nguyên</Link>
            </div>
          </div>
        )}
        {[
          { label: "Bài viết", list: posts },
          { label: "Tài liệu", list: res },
        ].map(
          (g) =>
            g.list.length > 0 && (
              <div key={g.label} className="flex flex-col gap-2.5">
                <h3 className="label m-0">{g.label.toUpperCase()} · {g.list.length}</h3>
                <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                  {g.list.map((i) => {
                    const external = i.url.startsWith("http");
                    return (
                      <li key={i.type + i.ref} className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-line px-5 py-4">
                        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-1">
                          {external ? (
                            <a href={i.url} target="_blank" rel="nofollow ugc noopener" className="inline-flex items-center gap-2 font-medium no-underline">{i.title} <ArrowUpRight /></a>
                          ) : (
                            <Link href={i.url} className="font-medium no-underline">{i.title}</Link>
                          )}
                          <span className="text-xs text-muted">Lưu ngày {day(i.savedAt)}</span>
                        </div>
                        <button type="button" onClick={() => remove(i)} className="btn h-10 border-line-strong px-4 text-sm">Bỏ lưu</button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ),
        )}
      </section>

      <section aria-labelledby="h-subs" className="wrap flex flex-col gap-5 pt-14">
        <h2 id="h-subs" className="h2-sm">Tài liệu bạn đã chia sẻ</h2>
        {subs === null ? (
          <p className="m-0 text-muted">Đang tải…</p>
        ) : subs.length === 0 ? (
          <p className="m-0 text-muted">Bạn chưa chia sẻ tài liệu nào.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {subs.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-line px-5 py-4">
                <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-1">
                  <a href={s.url} target="_blank" rel="nofollow ugc noopener" className="inline-flex items-center gap-2 font-medium no-underline">{s.title} <ArrowUpRight /></a>
                  <span className="text-xs text-muted">{topics[s.cat] ?? s.cat} · gửi ngày {day(s.createdAt)}</span>
                </div>
                <span className={s.status === "approved" ? "tag" : "chip"}>{STATUS[s.status] ?? s.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="h-danger" className="wrap flex flex-col items-start gap-3 py-16">
        <h2 id="h-danger" className="label m-0">XOÁ TÀI KHOẢN</h2>
        <p className="m-0 max-w-[600px] text-sm text-muted">Xoá tài khoản và mọi mục đã lưu. Tài liệu bạn đã chia sẻ vẫn giữ lại để Thương duyệt.</p>
        {confirmDelete ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-sm border-[#B42318] text-[#B42318]"
              onClick={async () => {
                try {
                  await acc.deleteAccount();
                  flash("Đã xoá tài khoản");
                } catch (e) {
                  flash(authMessage(e));
                  setConfirmDelete(false);
                }
              }}
            >
              Xoá vĩnh viễn
            </button>
            <button type="button" className="btn btn-sm" onClick={() => setConfirmDelete(false)}>Huỷ</button>
          </div>
        ) : (
          <button type="button" className="btn btn-sm border-line-strong" onClick={() => setConfirmDelete(true)}>Xoá tài khoản…</button>
        )}
      </section>

      <ShareResourceDialog
        open={sharing}
        onClose={() => setSharing(false)}
        onDone={() => {
          setSharing(false);
          flash("Đã gửi. Tài liệu sẽ hiện sau khi được duyệt.");
          mySubmissions().then(setSubs, () => {});
        }}
      />
      {node}
    </>
  );
}
