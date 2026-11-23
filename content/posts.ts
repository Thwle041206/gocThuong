// Blog posts. Live content comes from the CMS (Firestore) and is written to remote.json
// at deploy time. The seed list below is used when remote.json is empty (local dev, first deploy).
import type { Category } from "./projects";
import remote from "./remote.json";

export type Locale = "vi" | "en" | "zh";
export type PostTr = { title: string; excerpt: string; body?: string; seoTitle?: string; seoDesc?: string };

/** Shape stored in Firestore (posts/{slug}). */
export type PostDoc = {
  slug: string;
  cat: Category;
  original: Locale;
  status: "draft" | "published";
  date: string; // YYYY-MM-DD, publish date
  tags: string[];
  tr: Partial<Record<Locale, PostTr>>;
  updatedAt?: number; // ms
};

/** Shape used by the public pages. */
export type Post = {
  slug: string;
  cat: Category;
  lang: "VI" | "EN" | "中文";
  original: Locale;
  date: string;
  dateLabel: string;
  read: string;
  title: string;
  excerpt: string;
  tags: string[];
  tr: Partial<Record<Locale, PostTr>>;
};

export const LOCALE_LABEL: Record<Locale, "VI" | "EN" | "中文"> = { vi: "VI", en: "EN", zh: "中文" };

export const seedPosts: PostDoc[] = [
  { slug: "ai-design-hoi-cung-co-gia", cat: "AI", original: "vi", status: "published", date: "2026-10-06", tags: ["AI", "PROMPT", "BA"], tr: { vi: { title: "AI design – Hỏi cũng có giá", excerpt: "[Tóm tắt 1–2 câu: bài viết giúp người đọc hiểu điều gì]" } } },
  { slug: "north-star-metric", cat: "BA", original: "vi", status: "published", date: "2026-10-06", tags: ["BA", "METRIC"], tr: { vi: { title: "North Star Metric – chỉ số dẫn đường", excerpt: "North Star Metric là chỉ số quan trọng nhất mà công ty dùng để đo lường giá trị cốt lõi mang lại cho khách hàng." } } },
  { slug: "retention-cohorts", cat: "DỮ LIỆU", original: "en", status: "published", date: "2026-09-24", tags: ["DATA", "RETENTION"], tr: { en: { title: "Retention cohorts", excerpt: "[Tóm tắt 1–2 câu]" } } },
  { slug: "user-story-tinh-nang-ai", cat: "BA", original: "vi", status: "draft", date: "", tags: ["BA", "AI"], tr: { vi: { title: "Viết user story cho một tính năng AI", excerpt: "Chủ đề gợi ý — thể hiện kỹ năng BA cốt lõi." } } },
  { slug: "it-zhongwen-cihui", cat: "NGÔN NGỮ", original: "zh", status: "draft", date: "", tags: ["中文", "BA"], tr: { zh: { title: "BA 常用的 IT 中文词汇", excerpt: "Chủ đề gợi ý — chứng minh tiếng Trung chuyên ngành." } } },
  { slug: "from-ba-to-interpreter", cat: "NGÔN NGỮ", original: "en", status: "draft", date: "", tags: ["EN", "CAREER"], tr: { en: { title: "From BA to interpreter: my plan", excerpt: "Chủ đề gợi ý — kể hành trình, tạo kết nối." } } },
];

export function readingMinutes(body?: string) {
  const words = (body || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function toPublicPost(d: PostDoc): Post {
  const main = d.tr[d.original] || Object.values(d.tr)[0] || { title: d.slug, excerpt: "" };
  const [y, m, day] = (d.date || "").split("-");
  return {
    slug: d.slug,
    cat: d.cat,
    lang: LOCALE_LABEL[d.original],
    original: d.original,
    date: d.date,
    dateLabel: d.date ? `${day}.${m}.${y}` : "GỢI Ý",
    read: main.body ? `${readingMinutes(main.body)} phút` : "5 phút",
    title: main.title,
    excerpt: main.excerpt,
    tags: d.tags,
    tr: d.tr,
  };
}

const docs: PostDoc[] = ((remote as { posts?: PostDoc[] }).posts ?? seedPosts).filter((p) => p.status === "published");

export const posts: Post[] = docs.map(toPublicPost);

export const postFilters: { label: string; cat: Category | null }[] = [
  { label: "Tất cả", cat: null },
  { label: "BA", cat: "BA" },
  { label: "AI", cat: "AI" },
  { label: "Dữ liệu", cat: "DỮ LIỆU" },
  { label: "Ngôn ngữ", cat: "NGÔN NGỮ" },
];

/** Newest first. */
export const sortedPosts = [...posts].sort((a, b) => ((a.date || "0") < (b.date || "0") ? 1 : -1));
