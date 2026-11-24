import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Toc from "@/components/Toc";
import { DocGallery, ProjectActions } from "@/components/ProjectBits";
import { projects } from "@/content/projects";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  return { title: p ? `${p.title} · ${p.kind}` : "Dự án", description: p?.lead };
}

const toc = [
  { id: "boi-canh", label: "Bối cảnh" },
  { id: "van-de", label: "Vấn đề" },
  { id: "quy-trinh", label: "Quy trình BA" },
  { id: "tai-lieu", label: "Tài liệu BA" },
  { id: "user-story", label: "User story mẫu" },
  { id: "ket-qua", label: "Kết quả & bài học" },
];

const steps = [
  { title: "Khám phá", text: "Phỏng vấn stakeholder, quy trình hiện tại (as-is)." },
  { title: "Phân tích", text: "BPMN to-be, gap analysis, ưu tiên yêu cầu." },
  { title: "Đặc tả", text: "BRD, user story, wireframe, prompt spec cho AI." },
  { title: "Nghiệm thu", text: "UAT theo acceptance criteria, đo kết quả." },
];

function Section({ id, num, title, children, narrow }: { id: string; num: string; title: string; children: React.ReactNode; narrow?: boolean }) {
  return (
    <section id={id} aria-labelledby={`h-${id}`} className={`flex scroll-mt-6 flex-col gap-5 ${narrow ? "max-w-[720px]" : ""}`}>
      <span className="font-mono text-xs text-muted">{num}</span>
      <h2 id={`h-${id}`} className="h2-sm">{title}</h2>
      {children}
    </section>
  );
}

export default async function ProjectDetail({ params }: Props) {
  const { slug } = await params;
  const i = projects.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const p = projects[i];
  const next = projects[(i + 1) % projects.length];

  return (
    <>
      <nav aria-label="Breadcrumb" className="wrap pt-6">
        <ol className="m-0 flex list-none flex-wrap items-center gap-2.5 p-0 font-mono text-xs tracking-[0.06em] text-muted">
          <li><Link href="/" className="!text-muted no-underline">TRANG CHỦ</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/du-an/" className="!text-muted no-underline">DỰ ÁN</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">{p.title.toUpperCase()}</li>
        </ol>
      </nav>

      <section className="wrap flex flex-wrap items-end gap-12 pt-14">
        <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs text-muted">
            <span className="tag !text-xs">{p.cat}</span>
            <span>{p.kind} · {p.year}</span>
          </div>
          <h1 className="m-0 font-serif text-[clamp(34px,6.5vw,76px)] leading-[1.02] font-medium">{p.title}</h1>
          <p className="m-0 max-w-[48ch] text-xl leading-relaxed text-muted">{p.lead}</p>
          <ProjectActions />
        </div>
        <dl className="card m-0 grid flex-[1_1_320px] grid-cols-2 gap-x-4 gap-y-5 p-6">
          {[
            ["VAI TRÒ", p.meta.role],
            ["THỜI GIAN", p.meta.duration],
            ["NHÓM", p.meta.team],
            ["LĨNH VỰC", p.meta.domain],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1.5">
              <dt className="font-mono text-xs tracking-[0.08em] text-muted">{k}</dt>
              <dd className="m-0 text-base font-medium">{v}</dd>
            </div>
          ))}
          <div className="col-span-2 flex flex-col gap-2">
            <dt className="font-mono text-xs tracking-[0.08em] text-muted">CÔNG CỤ</dt>
            <dd className="m-0 flex flex-wrap gap-1.5">{p.meta.tools.map((t) => <span key={t} className="chip">{t}</span>)}</dd>
          </div>
        </dl>
      </section>

      <figure className="wrap mt-12 mb-0">
        <div className="placeholder aspect-[16/9] rounded-2xl bg-panel text-dim sm:aspect-[21/9]">[ẢNH BÌA: GIAO DIỆN SẢN PHẨM HOẶC SƠ ĐỒ TỔNG QUAN]</div>
      </figure>

      <section aria-label="Kết quả chính" className="wrap pt-8">
        <div className="flex flex-wrap gap-4">
          {p.results.map((r, k) => {
            const dark = k === p.results.length - 1;
            return (
              <div key={k} className={`flex flex-[1_1_260px] flex-col gap-1.5 rounded-2xl p-6 ${dark ? "bg-ink text-white" : "border border-line"}`}>
                <span className="font-serif text-5xl sm:text-6xl leading-none font-medium">{r.value}</span>
                <span className={`text-base ${dark ? "text-on-dark" : "text-muted"}`}>{r.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="wrap flex flex-wrap items-start gap-14 pt-[72px]">
        <aside className="flex-[0_0_210px] max-md:hidden">
          <Toc title="Trên trang này" items={toc} numbered />
        </aside>
        <div className="flex min-w-0 flex-[1_1_640px] flex-col gap-[72px]">
          <Section id="boi-canh" num="01" title="Bối cảnh" narrow>
            <p className="m-0 text-lg leading-[1.8]">{p.context}</p>
          </Section>
          <Section id="van-de" num="02" title="Vấn đề">
            <ol className="m-0 list-none border-t border-line p-0">
              {p.problems.map((x, k) => (
                <li key={k} className="flex gap-6 border-b border-line py-5 text-lg">
                  <span className="min-w-10 font-serif text-3xl">{k + 1}</span>
                  <span className="pt-1.5">{x}</span>
                </li>
              ))}
            </ol>
          </Section>
          <Section id="quy-trinh" num="03" title="Quy trình BA">
            <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 p-0">
              {steps.map((s, k) => {
                const dark = k === steps.length - 1;
                return (
                  <li key={s.title} className={`flex flex-col gap-2.5 rounded-[14px] p-[22px] ${dark ? "bg-ink text-white" : "border border-line"}`}>
                    <span className={`font-mono text-xs ${dark ? "text-dim" : "text-muted"}`}>BƯỚC {k + 1}</span>
                    <span className="font-serif text-2xl font-medium">{s.title}</span>
                    <span className={`text-sm leading-relaxed ${dark ? "text-on-dark" : "text-muted"}`}>{s.text}</span>
                  </li>
                );
              })}
            </ol>
          </Section>
          <Section id="tai-lieu" num="04" title="Tài liệu BA">
            <DocGallery docs={p.docs} />
          </Section>
          <Section id="user-story" num="05" title="User story mẫu">
            <div className="overflow-hidden rounded-2xl border border-line">
              <div className="flex flex-wrap justify-between gap-2 border-b border-line bg-mist px-5 py-3.5 font-mono text-xs text-muted">
                <span>{p.story.id} · {p.story.epic}</span>
                <span className="rounded bg-ink px-2 py-0.5 text-white">ƯU TIÊN: {p.story.priority}</span>
              </div>
              <div className="flex flex-col gap-5 px-5 py-6">
                <p className="m-0 font-serif text-2xl leading-[1.4]">
                  Là <b className="font-semibold">{p.story.role}</b>, tôi muốn <b className="font-semibold">{p.story.action}</b> để <b className="font-semibold">{p.story.value}</b>.
                </p>
                <div className="flex flex-col gap-2.5">
                  <span className="label">ACCEPTANCE CRITERIA</span>
                  <ul className="m-0 flex list-none flex-col gap-2 p-0 font-mono text-sm leading-relaxed">
                    <li className="rounded-lg bg-mist px-3.5 py-3"><b>CHO TRƯỚC</b> {p.story.given}</li>
                    <li className="rounded-lg bg-mist px-3.5 py-3"><b>KHI</b> {p.story.when}</li>
                    <li className="rounded-lg bg-mist px-3.5 py-3"><b>THÌ</b> {p.story.then}</li>
                  </ul>
                </div>
              </div>
            </div>
          </Section>
          <Section id="ket-qua" num="06" title="Kết quả & bài học">
            <div className="flex flex-wrap gap-4">
              {[
                ["ĐÃ ĐẠT ĐƯỢC", p.outcomes],
                ["NẾU LÀM LẠI", p.lessons],
              ].map(([h, list]) => (
                <div key={h as string} className="card flex flex-[1_1_280px] flex-col gap-3 p-6">
                  <span className="label">{h as string}</span>
                  <ul className="m-0 flex flex-col gap-2 pl-5 text-base leading-relaxed">
                    {(list as string[]).map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>

      <section className="wrap flex flex-wrap gap-4 pt-[88px]">
        <Link href={`/du-an/${next.slug}/`} className="card flex flex-[1_1_420px] items-center gap-5 p-4 no-underline">
          <span className="placeholder h-[110px] flex-[0_0_160px] rounded-[10px] bg-soft text-xs text-muted max-sm:flex-[0_0_110px]">{next.img}</span>
          <span className="flex flex-col gap-1.5">
            <span className="font-mono text-xs text-muted">DỰ ÁN TIẾP THEO →</span>
            <span className="font-serif text-3xl font-medium">{next.title} · {next.kind.toLowerCase()}</span>
          </span>
        </Link>
        <div className="flex flex-[1_1_420px] flex-wrap items-center justify-between gap-4 rounded-2xl bg-ink p-7 text-white">
          <span className="max-w-[16ch] font-serif text-3xl leading-[1.2]">Cần một BA cho dự án tương tự?</span>
          <Link href="/#lien-he" className="btn btn-light btn-sm font-semibold">Liên hệ</Link>
        </div>
      </section>
    </>
  );
}
