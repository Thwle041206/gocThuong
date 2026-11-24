import type { Metadata } from "next";
import Link from "next/link";
import { Timeline, TranslationSamples } from "@/components/JourneyBits";
import { channels, languages, roadmap } from "@/content/journey";

export const metadata: Metadata = {
  title: "Hành trình ngôn ngữ",
  description: "Lộ trình, tiến độ thật và sản phẩm thật: tiếng Anh, tiếng Trung, từ BA đến phiên dịch.",
};

export default function JourneyPage() {
  return (
    <>
      <nav aria-label="Breadcrumb" className="wrap pt-6">
        <ol className="m-0 flex list-none flex-wrap items-center gap-2.5 p-0 font-mono text-xs tracking-[0.06em] text-muted">
          <li><Link href="/" className="!text-muted no-underline">TRANG CHỦ</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">HÀNH TRÌNH NGÔN NGỮ</li>
        </ol>
      </nav>

      <section className="wrap flex flex-wrap items-end justify-between gap-10 pt-7">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
          <p className="eyebrow">● VI · EN · 中文 — TỪ BA ĐẾN PHIÊN DỊCH</p>
          <h1 className="m-0 max-w-[17ch] font-serif text-[clamp(28px,4.8vw,54px)] leading-[1.05] font-medium">
            BA phiên dịch giữa kinh doanh và công nghệ. Mình muốn phiên dịch cả giữa con người.
          </h1>
          <p className="m-0 max-w-[52ch] text-lg leading-relaxed text-muted">Lộ trình, tiến độ thật và sản phẩm thật — cập nhật mỗi khi mình đạt một mốc mới.</p>
        </div>
        <div id="kenh" className="flex flex-[1_1_300px] flex-col gap-2.5">
          <span className="font-mono text-xs tracking-[0.08em] text-muted">THEO DÕI SẢN PHẨM THẬT THEO NGÔN NGỮ</span>
          {channels.map((c) => (
            <a key={c.name} href={c.url} className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-3 no-underline">
              <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-ink font-mono text-xs text-white">{c.abbr}</span>
              <span className="flex flex-1 flex-col gap-px">
                <span className="text-sm font-semibold">{c.name}</span>
                <span className="text-xs text-muted">{c.what}</span>
              </span>
              <span aria-hidden="true" className="text-sm">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section aria-labelledby="h-road" className="wrap flex flex-col gap-6 pt-[72px]">
        <h2 id="h-road" className="h2-sm">Lộ trình</h2>
        <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-y-8 p-0">
          {roadmap.map((r, i) => {
            const last = i === roadmap.length - 1;
            return (
              <li key={r.title} className="flex flex-col gap-2.5 pr-5">
                <div className="flex items-center">
                  {r.st === "done" && <span aria-hidden="true" className="h-[18px] w-[18px] flex-none rounded-full bg-ink" />}
                  {r.st === "now" && <span aria-hidden="true" className="h-[18px] w-[18px] flex-none rounded-full bg-ink shadow-[0_0_0_5px_#E3E3E3]" />}
                  {r.st === "next" && <span aria-hidden="true" className="box-border h-[18px] w-[18px] flex-none rounded-full border-2 border-dashed border-[#9A9A9A]" />}
                  <span aria-hidden="true" className={`ml-2 h-0.5 flex-1 ${last ? "bg-transparent" : r.st === "next" ? "bg-line-strong" : "bg-ink"}`} />
                </div>
                <span className="font-mono text-xs tracking-[0.08em] text-muted">{r.when}</span>
                <span className="font-serif text-2xl leading-[1.15] font-medium">{r.title}</span>
                <span className="text-sm leading-[1.55] text-muted">{r.desc}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="h-prog" className="wrap flex flex-col gap-6 pt-[72px]">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="h-prog" className="h2-sm">Tiến độ từng ngôn ngữ</h2>
          <span className="text-sm text-muted">Tính theo cấp độ chứng chỉ, không ước lượng.</span>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-4">
          {languages.map((l) => (
            <article key={l.name} className="card flex flex-col gap-4 p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 lang={l.name === "中文" ? "zh" : undefined} className="m-0 font-serif text-3xl font-medium">{l.name}</h3>
                <span className="font-mono text-xs text-muted">{l.scale}</span>
              </div>
              <div className="flex flex-col gap-2">
                <div role="img" aria-label={l.aria} className="grid grid-cols-6 gap-1">
                  {l.labels.map((_, i) =>
                    i < l.now ? (
                      <span key={i} className="h-2.5 rounded-[3px] bg-ink" />
                    ) : i < l.goal ? (
                      <span key={i} className="box-border h-2.5 rounded-[3px] border border-[#BDBDBD] bg-[repeating-linear-gradient(45deg,#BDBDBD_0_3px,#FFFFFF_3px_6px)]" />
                    ) : (
                      <span key={i} className="h-2.5 rounded-[3px] bg-[#EFEFEF]" />
                    ),
                  )}
                </div>
                <div className="grid grid-cols-6 gap-1 font-mono text-xs text-muted">
                  {l.labels.map((lab, i) => <span key={i} className="text-center">{lab}</span>)}
                </div>
              </div>
              <dl className="m-0 grid grid-cols-[96px_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                <dt className="text-muted">Hiện tại</dt><dd className="m-0 font-semibold">{l.nowText}</dd>
                <dt className="text-muted">Mục tiêu</dt><dd className="m-0 font-semibold">{l.goalText}</dd>
                <dt className="text-muted">Làm được</dt><dd className="m-0 leading-[1.55]">{l.can}</dd>
              </dl>
              {l.proof && <a href="#" className="self-start text-sm font-semibold underline-offset-4">{l.proof}</a>}
            </article>
          ))}
        </div>
      </section>

      <Timeline />
      <TranslationSamples />

      <section className="wrap pt-[72px]">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[20px] bg-ink p-8 text-white sm:p-12">
          <div className="flex flex-col gap-2">
            <h2 className="m-0 font-serif text-[clamp(28px,4vw,44px)] leading-[1.1] font-medium">Cần dịch tài liệu IT?</h2>
            <p className="m-0 text-base text-[#BDBDBD]">BRD, user story, tài liệu sản phẩm · EN ⇄ VI ⇄ 中文</p>
          </div>
          <Link href="/#lien-he" className="btn btn-light font-semibold">Liên hệ</Link>
        </div>
      </section>
    </>
  );
}
