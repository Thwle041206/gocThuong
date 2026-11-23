// Blog posts. Add a new object to publish a new post at /bai-viet/<slug>/.
import type { Category } from "./projects";

export type Post = {
  slug: string;
  cat: Category;
  lang: "VI" | "EN" | "中文";
  date: string; // YYYY-MM-DD, empty for drafts / ideas
  dateLabel: string;
  read: string;
  title: string;
  excerpt: string;
  tags: string[];
};

export const posts: Post[] = [
  { slug: "ai-design-hoi-cung-co-gia", cat: "AI", lang: "VI", date: "2026-10-06", dateLabel: "06.10.2026", read: "5 phút", title: "AI design – Hỏi cũng có giá", excerpt: "[Tóm tắt 1–2 câu: bài viết giúp người đọc hiểu điều gì]", tags: ["AI", "PROMPT", "BA"] },
  { slug: "north-star-metric", cat: "BA", lang: "VI", date: "2026-10-06", dateLabel: "06.10.2026", read: "5 phút", title: "North Star Metric – chỉ số dẫn đường", excerpt: "North Star Metric là chỉ số quan trọng nhất mà công ty dùng để đo lường giá trị cốt lõi mang lại cho khách hàng.", tags: ["BA", "METRIC"] },
  { slug: "retention-cohorts", cat: "DỮ LIỆU", lang: "EN", date: "2026-09-24", dateLabel: "24.09.2026", read: "5 phút", title: "Retention cohorts", excerpt: "[Tóm tắt 1–2 câu]", tags: ["DATA", "RETENTION"] },
  { slug: "user-story-tinh-nang-ai", cat: "BA", lang: "VI", date: "", dateLabel: "GỢI Ý", read: "nháp", title: "Viết user story cho một tính năng AI", excerpt: "Chủ đề gợi ý — thể hiện kỹ năng BA cốt lõi.", tags: ["BA", "AI"] },
  { slug: "it-zhongwen-cihui", cat: "NGÔN NGỮ", lang: "中文", date: "", dateLabel: "GỢI Ý", read: "nháp", title: "BA 常用的 IT 中文词汇", excerpt: "Chủ đề gợi ý — chứng minh tiếng Trung chuyên ngành.", tags: ["中文", "BA"] },
  { slug: "from-ba-to-interpreter", cat: "NGÔN NGỮ", lang: "EN", date: "", dateLabel: "GỢI Ý", read: "nháp", title: "From BA to interpreter: my plan", excerpt: "Chủ đề gợi ý — kể hành trình, tạo kết nối.", tags: ["EN", "CAREER"] },
];

export const postFilters: { label: string; cat: Category | null }[] = [
  { label: "Tất cả", cat: null },
  { label: "BA", cat: "BA" },
  { label: "AI", cat: "AI" },
  { label: "Dữ liệu", cat: "DỮ LIỆU" },
  { label: "Ngôn ngữ", cat: "NGÔN NGỮ" },
];

/** Newest first; drafts/ideas (no date) go last. */
export const sortedPosts = [...posts].sort((a, b) => ((a.date || "0") < (b.date || "0") ? 1 : -1));
