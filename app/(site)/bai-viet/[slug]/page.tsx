import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostReader from "@/components/PostReader";
import { Feedback } from "@/components/PostBits";
import { renderMarkdown } from "@/lib/markdown";
import { site } from "@/content/site";
import { sortedPosts as posts, LOCALE_LABEL, type Locale } from "@/content/posts";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  // A static export needs at least one page; with nothing published this renders the 404 page.
  const list = posts.map((p) => ({ slug: p.slug }));
  return list.length ? list : [{ slug: "chua-co" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = posts.find((x) => x.slug === slug);
  return { title: p?.title ?? "Bài viết", description: p?.excerpt, openGraph: { type: "article" } };
}

const toc = [
  { id: "boi-canh", label: "Bối cảnh" },
  { id: "van-de", label: "Vấn đề" },
  { id: "cach-tiep-can", label: "Cách tiếp cận" },
  { id: "bai-hoc", label: "Bài học" },
];

const h2 = "mt-4 mb-0 scroll-mt-6 font-serif text-3xl sm:text-4xl leading-[1.2] font-medium";

export default async function PostDetail({ params }: Props) {
  const { slug } = await params;
  const i = posts.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const p = posts[i];
  const prev = posts[i + 1];
  const next = posts[i - 1];
  const related = [...posts.filter((x) => x.slug !== slug && x.cat === p.cat), ...posts.filter((x) => x.slug !== slug && x.cat !== p.cat)].slice(0, 3);
  const zh = p.lang === "中文" ? "zh" : undefined;
  const versions = (Object.keys(p.tr) as Locale[]).map((id) => {
    const t = p.tr[id]!;
    const r = t.body?.trim() ? renderMarkdown(t.body) : { html: undefined, headings: [] };
    return { id, label: LOCALE_LABEL[id], title: t.title, excerpt: t.excerpt, html: r.html, headings: r.headings };
  });

  return (
    <>
      <nav aria-label="Breadcrumb" className="wrap pt-6">
        <ol className="m-0 flex list-none flex-wrap items-center gap-2.5 p-0 font-mono text-xs tracking-[0.06em] text-muted">
          <li><Link href="/" className="!text-muted no-underline">TRANG CHỦ</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/bai-viet/" className="!text-muted no-underline">BÀI VIẾT</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink" lang={zh}>{p.title.toUpperCase()}</li>
        </ol>
      </nav>

      <article>
        <PostReader
          slug={p.slug}
          original={p.original}
          versions={versions}
          placeholderToc={toc}
          refs={p.refs}
          meta={
            <div className="flex flex-wrap items-center justify-center gap-2.5 font-mono text-xs text-muted">
              <span className="tag !text-xs">{p.cat}</span>
              <span>{p.lang} · {p.dateLabel} · {p.read.toUpperCase()} ĐỌC</span>
            </div>
          }
          author={
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full bg-ink font-serif text-2xl text-white">T</span>
              <span className="flex flex-col leading-[1.35]">
                <span className="font-semibold">{site.author}</span>
                <span className="text-sm text-muted">{site.role}</span>
              </span>
            </div>
          }
          placeholder={
            <>
              <p className="m-0 text-xl leading-[1.7]">[Đoạn mở: nêu vấn đề hoặc câu hỏi chính trong 2–3 câu, để người đọc biết vì sao nên đọc tiếp.]</p>
              <h2 id="boi-canh" className={h2}>Bối cảnh</h2>
              <p className="m-0">[Tình huống thực tế: dự án, nhóm, công cụ AI đang dùng. Viết ngắn, cụ thể.]</p>
              <blockquote className="mx-0 my-2 border-y border-ink py-7 text-center font-serif text-3xl leading-[1.35] italic">[Một câu đáng nhớ nhất của bài — câu người đọc sẽ chia sẻ lại.]</blockquote>
              <h2 id="van-de" className={h2}>Vấn đề</h2>
              <ul className="m-0 flex flex-col gap-2 pl-[22px]">
                <li>[Ý 1: chi phí / thời gian khi hỏi AI không rõ ràng]</li>
                <li>[Ý 2]</li>
                <li>[Ý 3]</li>
              </ul>
              <h2 id="cach-tiep-can" className={h2}>Cách tiếp cận</h2>
              <p className="m-0">[Các bước bạn đã làm. Có thể dùng danh sách đánh số.]</p>
              <div className="flex flex-col gap-2 rounded-xl bg-soft px-6 py-5">
                <span className="label">GHI CHÚ CỦA BA</span>
                <span className="text-base leading-[1.7]">[Mẹo thực tế hoặc mẫu prompt ngắn người đọc có thể dùng ngay.]</span>
              </div>
              <h2 id="bai-hoc" className={h2}>Bài học</h2>
              <p className="m-0">[2–3 điều rút ra. Kết bằng một câu hỏi mở cho người đọc.] Viết nội dung bài trong trang quản trị để thay khung mẫu này.</p>
            </>
          }
        >
            <div className="flex flex-wrap gap-2 pt-4">
              {p.tags.map((t) => (
                <Link key={t} href="/bai-viet/" className="rounded-md bg-soft px-3 py-2 font-mono text-xs no-underline">#{t}</Link>
              ))}
            </div>
            <Feedback />
            <div className="flex flex-wrap gap-5 rounded-2xl bg-ink p-7 text-white">
              <span aria-hidden="true" className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-white font-serif text-3xl text-ink">T</span>
              <div className="flex flex-[1_1_300px] flex-col gap-2 text-base leading-relaxed">
                <span className="label !text-dim">TÁC GIẢ</span>
                <span className="font-serif text-2xl">{site.author}</span>
                <span className="text-on-dark">{site.bio}</span>
                <Link href="/#lien-he" className="font-semibold !text-white underline-offset-4">Kết nối với mình →</Link>
              </div>
            </div>
        </PostReader>

        <nav aria-label="Bài trước và bài sau" className="mx-auto flex max-w-[1104px] flex-wrap gap-4 px-4 pt-14 sm:px-8">
          {prev && (
            <Link href={`/bai-viet/${prev.slug}/`} className="flex flex-[1_1_320px] flex-col gap-2 rounded-[14px] border border-line p-6 no-underline">
              <span className="font-mono text-xs text-muted">← BÀI TRƯỚC</span>
              <span className="font-serif text-2xl font-medium">{prev.title}</span>
            </Link>
          )}
          {next && (
            <Link href={`/bai-viet/${next.slug}/`} className="flex flex-[1_1_320px] flex-col items-end gap-2 rounded-[14px] border border-line p-6 text-right no-underline">
              <span className="font-mono text-xs text-muted">BÀI SAU →</span>
              <span className="font-serif text-2xl font-medium">{next.title}</span>
            </Link>
          )}
        </nav>

        <section aria-labelledby="h-lienquan" className="mx-auto flex max-w-[1104px] flex-col gap-6 px-4 pt-[72px] sm:px-8">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="h-lienquan" className="m-0 font-serif text-4xl sm:text-5xl font-medium">Bài viết liên quan</h2>
            <Link href="/bai-viet/" className="text-sm font-semibold tracking-[0.04em]">XEM TẤT CẢ ↗</Link>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-5">
            {related.map((r) => (
              <Link key={r.slug} href={`/bai-viet/${r.slug}/`} className="card flex flex-col gap-3 p-3 pb-5 no-underline">
                <div className="flex aspect-[16/10] items-center justify-center rounded-[10px] bg-panel p-4 text-center font-serif text-xl text-white">{r.title}</div>
                <div className="flex items-center gap-2 px-2 font-mono text-xs text-muted">
                  <span className="tag">{r.cat}</span>{r.lang} · {r.date ? r.read.toUpperCase() : "GỢI Ý"}
                </div>
                <span className="px-2 font-serif text-2xl leading-[1.2] font-medium">{r.title}</span>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </>
  );
}
