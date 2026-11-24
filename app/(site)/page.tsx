import Link from "next/link";
import HomeHero from "@/components/HomeHero";
import { site } from "@/content/site";
import { projects } from "@/content/projects";
import { sortedPosts } from "@/content/posts";

export default function Home() {
  const featured = projects.filter((p) => p.featured).slice(0, 3);
  const latest = sortedPosts.filter((p) => p.date).slice(0, 3);

  return (
    <>
      <HomeHero />

      <section aria-label="Hiện tại" className="wrap pb-24">
        <dl className="m-0 flex flex-wrap border-t border-line">
          {site.now.map((n) => (
            <div key={n.label} className="flex flex-[1_1_240px] flex-col gap-2 pt-6 pr-6">
              <dt className="label">{n.label}</dt>
              <dd className="m-0 flex items-center gap-2 text-lg font-medium">
                {n.dot && <span aria-hidden="true" className="h-2 w-2 rounded-full bg-ink" />}
                {n.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="h-duan" className="wrap flex flex-col gap-8 pb-[104px]">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="h-duan" className="h2">Dự án nổi bật</h2>
          <Link href="/du-an/" className="font-mono text-sm tracking-[0.06em]">TẤT CẢ DỰ ÁN →</Link>
        </div>
        <div className="flex flex-wrap gap-6">
          {featured.map((p) => (
            <Link key={p.slug} href={`/du-an/${p.slug}/`} className="card flex min-w-0 flex-[1_1_340px] flex-col gap-3.5 p-3 pb-6 no-underline">
              <div className="placeholder aspect-[4/3] rounded-[10px] bg-panel text-dim">{p.img}</div>
              <span className="label px-1">{p.cat} · {p.year}</span>
              <span className="px-1 font-serif text-3xl leading-[1.15] font-medium">{p.title}</span>
              <span className="px-1 text-base leading-relaxed text-muted">{p.summary}</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="h-ngonngu" className="border-y border-line bg-mist">
        <div className="wrap flex flex-wrap gap-12 py-[88px]">
          <div className="flex flex-[1_1_320px] flex-col gap-3.5">
            <h2 id="h-ngonngu" className="h2 leading-[1.05]">Hành trình<br />ngôn ngữ</h2>
            <p className="m-0 max-w-[34ch] text-base leading-[1.65] text-muted">Mục tiêu: phiên dịch cho các cuộc họp công nghệ và kinh doanh.</p>
            <Link href="/hanh-trinh-ngon-ngu/" className="btn btn-dark btn-sm mt-2 self-start text-sm">Xem lộ trình &amp; sản phẩm →</Link>
          </div>
          <ul className="m-0 flex flex-[2_1_560px] list-none flex-col p-0">
            {[
              { name: "Tiếng Việt", now: "Bản ngữ" },
              { name: "English", now: "[Điểm hiện tại]", goal: "→ [MỤC TIÊU]" },
              { name: "中文", now: "[HSK hiện tại]", goal: "→ [HSK MỤC TIÊU]", zh: true },
              { name: "+ Ngôn ngữ mới", now: "Sắp tới", muted: true },
            ].map((l, i, arr) => (
              <li key={l.name} className={`flex flex-wrap justify-between gap-x-6 gap-y-2 py-5 ${i < arr.length - 1 ? "border-b border-line" : ""}`}>
                <span lang={l.zh ? "zh" : undefined} className={`min-w-[140px] text-lg font-medium ${l.muted ? "text-muted" : ""}`}>{l.name}</span>
                <span className="flex-[1_1_200px] text-muted">{l.now}</span>
                {l.goal && <span className="font-mono text-sm">{l.goal}</span>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="h-baiviet" className="wrap flex flex-col gap-6 py-24">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="h-baiviet" className="h2">Bài viết mới</h2>
          <Link href="/bai-viet/" className="font-mono text-sm tracking-[0.06em]">TẤT CẢ BÀI VIẾT →</Link>
        </div>
        <div className="flex flex-col border-t border-line">
          {latest.map((p) => (
            <Link key={p.slug} href={`/bai-viet/${p.slug}/`} className="flex flex-wrap items-baseline gap-x-8 gap-y-2 border-b border-line py-[22px] no-underline">
              <span className="min-w-[120px] font-mono text-xs text-muted">{p.dateLabel}</span>
              <span className="flex-[1_1_420px] font-serif text-2xl font-medium">{p.title}</span>
              <span className="font-mono text-xs text-muted">{p.cat} · {p.read.toUpperCase()}</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="lien-he" aria-labelledby="h-lienhe" className="wrap scroll-mt-6">
        <div className="flex flex-wrap items-center justify-between gap-8 rounded-[20px] bg-ink p-8 text-white sm:p-14">
          <div className="flex flex-col gap-2.5">
            <h2 id="h-lienhe" className="m-0 font-serif text-[clamp(30px,5vw,52px)] leading-[1.05] font-medium">Cùng làm việc nhé.</h2>
            <p className="m-0 text-base text-[#BDBDBD]">Dự án BA/AI, tài liệu song ngữ, hoặc một buổi cà phê.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={`mailto:${site.email}`} className="btn btn-light">{site.email}</a>
            <a href={site.cvUrl} className="btn btn-ghost-light btn-sm h-[52px]">Tải CV</a>
          </div>
        </div>
      </section>
    </>
  );
}
