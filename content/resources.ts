// Shared links on the "Kết nối" page.

export type Resource = { id: number; cat: string; title: string; url: string; desc: string; by: string; likes: number };

export const topics: Record<string, string> = {
  BA: "BA & Quy trình",
  AI: "AI & Công cụ",
  "NGÔN NGỮ": "Ngôn ngữ",
  "THIẾT KẾ": "Thiết kế",
  "KỸ THUẬT": "Kỹ thuật",
};

export const resourceTabs: { label: string; cat: string | null }[] = [
  { label: "Tất cả", cat: null },
  { label: "BA", cat: "BA" },
  { label: "AI", cat: "AI" },
  { label: "Ngôn ngữ", cat: "NGÔN NGỮ" },
  { label: "Thiết kế", cat: "THIẾT KẾ" },
  { label: "Kỹ thuật", cat: "KỸ THUẬT" },
];

export const resources: Resource[] = [
  { id: 1, cat: "BA", title: "[Mẫu BRD & user story]", url: "#", desc: "Gợi ý thêm — mục BA là thế mạnh của bạn, nên có tài liệu riêng.", by: "Thương", likes: 0 },
  { id: 2, cat: "AI", title: "Google AI Studio & Gemini API Interactive Guide", url: "https://ai.google.dev/", desc: "Thực hành mô hình ngôn ngữ lớn: Structured Outputs, Function Calling, multimodal.", by: "AI Explorer", likes: 27 },
  { id: 3, cat: "AI", title: "Raycast – Tối ưu workflow", url: "https://www.raycast.com/", desc: "Thay thế Spotlight với extensions quản lý clipboard, phím tắt, tìm tài liệu.", by: "Quốc Bảo", likes: 20 },
  { id: 4, cat: "NGÔN NGỮ", title: "[Tài liệu luyện HSK / IELTS]", url: "#", desc: "Gợi ý thêm — chia sẻ nguồn bạn đang dùng để học.", by: "Thương", likes: 0 },
  { id: 5, cat: "THIẾT KẾ", title: "Figma Design System UI Kits & Tokens", url: "https://www.figma.com/", desc: "Xây Design System từ tokens, biến màu, typography đến responsive variants.", by: "Hoài Thương", likes: 24 },
  { id: 6, cat: "THIẾT KẾ", title: "Laws of UX", url: "https://lawsofux.com/", desc: "Nguyên lý tâm lý học (Fitts, Hick, Miller, Jakob) cho quyết định thiết kế.", by: "Minh Nhật", likes: 15 },
  { id: 7, cat: "KỸ THUẬT", title: "Tailwind CSS v4", url: "https://tailwindcss.com/", desc: "Kiến trúc CSS mới không runtime, cascade layers và biến CSS native.", by: "Dev Hiroki", likes: 31 },
  { id: 8, cat: "KỸ THUẬT", title: "TypeScript Handbook & Advanced Patterns", url: "https://www.typescriptlang.org/docs/", desc: "Từ cơ bản đến Generics, Mapped Types, type-safe cho React components.", by: "Thành Nam", likes: 22 },
];
