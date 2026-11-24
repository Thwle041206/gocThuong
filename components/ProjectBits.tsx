"use client";

import { useState } from "react";
import type { Project } from "@/content/projects";
import { Download, Share } from "./icons";
import { copyLink, useToast } from "./Toast";

export function ProjectActions() {
  const { flash, node } = useToast();
  return (
    <div className="flex flex-wrap gap-2.5 pt-1">
      <button type="button" onClick={() => flash("Tài liệu BA (PDF) sẽ có khi bạn tải file lên.")} className="btn btn-dark btn-sm">
        <Download /> Tải tài liệu BA (PDF)
      </button>
      <button
        type="button"
        onClick={async () => {
          await copyLink();
          flash("Đã sao chép link dự án");
        }}
        className="btn btn-sm"
      >
        <Share /> Chia sẻ
      </button>
      {node}
    </div>
  );
}

export function DocGallery({ docs }: { docs: Project["docs"] }) {
  const [i, setI] = useState(0);
  const doc = docs[i];
  return (
    <>
      <figure className="m-0 flex flex-col gap-2.5">
        <div className="flex aspect-video flex-col items-center justify-center gap-2.5 rounded-[14px] bg-panel text-white">
          <span className="font-serif text-4xl">{doc.name}</span>
          <span className="font-mono text-xs text-dim">[ẢNH {doc.img}]</span>
        </div>
        <figcaption className="flex justify-between gap-3 text-sm text-muted">
          <span>{doc.caption}</span>
          <span className="font-mono text-xs">{i + 1} / {docs.length}</span>
        </figcaption>
      </figure>
      <div role="group" aria-label="Chọn tài liệu" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {docs.map((d, k) => (
          <button
            key={d.name}
            type="button"
            aria-pressed={k === i}
            onClick={() => setI(k)}
            className={`flex cursor-pointer flex-col gap-2 rounded-xl border-2 bg-white p-2 pb-3 text-left ${k === i ? "border-ink" : "border-line"}`}
          >
            <span className={`aspect-[4/3] w-full rounded-lg ${k === i ? "bg-panel" : "bg-soft"}`} />
            <span className={`px-1 text-sm ${k === i ? "font-semibold" : "text-muted"}`}>{d.name}</span>
          </button>
        ))}
      </div>
    </>
  );
}
