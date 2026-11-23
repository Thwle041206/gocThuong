"use client";

import { useState, type ReactNode } from "react";
import Toc from "./Toc";
import { PostToolbar } from "./PostBits";
import type { Heading } from "@/lib/markdown";

export type ReaderVersion = { id: string; label: string; title: string; excerpt: string; html?: string; headings: Heading[] };

/** Header + body of a post, with a VI / EN / 中文 switch when translations exist. */
export default function PostReader({
  slug,
  meta,
  versions,
  original,
  author,
  placeholder,
  placeholderToc,
  children,
}: {
  slug: string;
  meta: ReactNode;
  versions: ReaderVersion[];
  original: string;
  author: ReactNode;
  placeholder: ReactNode;
  placeholderToc: Heading[];
  children: ReactNode;
}) {
  const [cur, setCur] = useState(original);
  const v = versions.find((x) => x.id === cur) ?? versions[0];
  const all = [
    { id: "vi", label: "VI" },
    { id: "en", label: "EN" },
    { id: "zh", label: "中文" },
  ].map((l) => ({ ...l, available: versions.some((x) => x.id === l.id) }));
  const langs = all.filter((l) => l.available || ["vi", "en"].includes(l.id));
  const zh = v.id === "zh" ? "zh" : undefined;
  const toc = v.html ? v.headings : placeholderToc;

  return (
    <>
      <header className="mx-auto flex max-w-[820px] flex-col items-center gap-5 px-4 pt-14 text-center sm:px-8">
        {meta}
        <h1 lang={zh} className="m-0 font-serif text-[clamp(42px,6vw,68px)] leading-[1.05] font-medium">{v.title}</h1>
        <p lang={zh} className="m-0 max-w-[46ch] text-xl leading-relaxed text-muted">{v.excerpt}</p>
      </header>

      <div className="mx-auto max-w-[820px] px-4 pt-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
          {author}
          <PostToolbar slug={slug} langs={langs} current={v.id} onLang={setCur} />
        </div>
      </div>

      <figure className="mx-auto mt-10 mb-0 flex max-w-[1104px] flex-col gap-2.5 px-4 sm:px-8">
        <div className="placeholder aspect-[16/9] rounded-2xl bg-panel text-dim sm:aspect-[21/9]">[ẢNH BÌA BÀI VIẾT]</div>
      </figure>

      <div className="mx-auto flex max-w-[1104px] flex-wrap items-start gap-12 px-4 pt-14 sm:px-8">
        {toc.length > 0 && (
          <aside className="flex-[0_0_200px] max-md:hidden">
            <Toc key={v.id} title="Mục lục" items={toc} />
          </aside>
        )}
        <div className="flex min-w-0 max-w-[700px] flex-[1_1_560px] flex-col gap-6 text-lg leading-[1.8]">
          {v.html ? <div lang={zh} className="prose-gt" dangerouslySetInnerHTML={{ __html: v.html }} /> : placeholder}
          {children}
        </div>
      </div>
    </>
  );
}
