"use client";

import { useEffect, useState } from "react";
import { Bookmark, Share, ThumbDown, ThumbUp } from "./icons";
import { copyLink, useToast } from "./Toast";

export function PostToolbar({ slug, lang }: { slug: string; lang: string }) {
  const { flash, node } = useToast();
  const [saved, setSaved] = useState(false);
  const key = `saved:${slug}`;
  useEffect(() => {
    try {
      setSaved(localStorage.getItem(key) === "1");
    } catch {}
  }, [key]);
  const toggle = () => {
    const v = !saved;
    setSaved(v);
    try {
      v ? localStorage.setItem(key, "1") : localStorage.removeItem(key);
    } catch {}
    flash(v ? "Đã lưu bài viết" : "Đã bỏ lưu");
  };
  const readLangs = ["VI", "EN"];
  return (
    <div className="flex items-center gap-2">
      <div role="group" aria-label="Đọc bằng ngôn ngữ" className="flex items-center gap-1.5 text-[13px] text-muted">
        Đọc bằng
        <span className="flex rounded-[10px] border border-line p-0.5 font-mono text-xs">
          {readLangs.map((l) => {
            const on = l === (lang === "中文" ? "VI" : lang);
            return (
              <button
                key={l}
                type="button"
                aria-pressed={on}
                onClick={() => !on && flash("Bản dịch sẽ có khi bài được dịch")}
                className={`h-10 min-w-11 cursor-pointer rounded-lg border-0 ${on ? "bg-ink text-white" : "bg-transparent text-muted"}`}
              >
                {l}
              </button>
            );
          })}
        </span>
      </div>
      <button
        type="button"
        aria-pressed={saved}
        aria-label={saved ? "Bỏ lưu bài viết" : "Lưu bài viết"}
        onClick={toggle}
        className={`inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] border ${saved ? "border-ink bg-ink" : "border-line-strong bg-white"}`}
      >
        <Bookmark filled={saved} />
      </button>
      <button
        type="button"
        aria-label="Chia sẻ"
        onClick={async () => {
          await copyLink();
          flash("Đã sao chép link bài viết");
        }}
        className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] border border-line-strong bg-white"
      >
        <Share />
      </button>
      {node}
    </div>
  );
}

export function Feedback() {
  const [voted, setVoted] = useState(false);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-line px-6 py-5 text-base">
      {voted ? (
        <span role="status" className="font-medium">Cảm ơn bạn đã phản hồi!</span>
      ) : (
        <>
          <span className="font-medium">Bài viết này có hữu ích không?</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setVoted(true)} className="btn h-11 gap-2 border-line-strong px-4 text-sm"><ThumbUp />Có</button>
            <button type="button" onClick={() => setVoted(true)} className="btn h-11 gap-2 border-line-strong px-4 text-sm"><ThumbDown />Không</button>
          </div>
        </>
      )}
    </div>
  );
}
