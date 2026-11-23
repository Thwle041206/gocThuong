// Projects (case studies). Add a new object to publish a new project page at /du-an/<slug>/.

export type Category = "BA" | "AI" | "DỮ LIỆU" | "NGÔN NGỮ";

export type Project = {
  slug: string;
  cat: Category;
  year: number;
  kind: string;
  img: string;
  chips: string[];
  title: string;
  summary: string;
  featured?: boolean;
  lead: string;
  meta: { role: string; duration: string; team: string; domain: string; tools: string[] };
  results: { value: string; label: string }[];
  context: string;
  problems: string[];
  docs: { name: string; img: string; caption: string }[];
  story: { id: string; epic: string; priority: string; role: string; action: string; value: string; given: string; when: string; then: string };
  outcomes: string[];
  lessons: string[];
};

const base = {
  title: "[Tên dự án]",
  summary: "[Vấn đề] → [Kết quả đo được]",
  lead: "[Một câu: dự án giải quyết vấn đề gì, cho ai, và vai trò của bạn.]",
  meta: { role: "Business Analyst", duration: "[x tháng]", team: "[PO · Dev · QA]", domain: "[Ngành]", tools: ["Jira", "Figma", "BPMN", "LLM"] },
  results: [
    { value: "[+__%]", label: "[Chỉ số 1, ví dụ: thời gian xử lý yêu cầu]" },
    { value: "[__]", label: "[Chỉ số 2, ví dụ: số user story đã đặc tả]" },
    { value: "[__]", label: "[Chỉ số 3, ví dụ: tỷ lệ yêu cầu bị làm lại giảm]" },
  ],
  context: "[Doanh nghiệp / sản phẩm là gì, người dùng là ai, vì sao dự án bắt đầu. 3–4 câu.]",
  problems: ["[Pain point 1 — kèm con số nếu có]", "[Pain point 2]", "[Pain point 3]"],
  docs: [
    { name: "BRD", img: "TRANG BRD", caption: "Business Requirements Document — phạm vi, yêu cầu nghiệp vụ." },
    { name: "User story map", img: "STORY MAP", caption: "Bản đồ user story theo hành trình người dùng." },
    { name: "BPMN to-be", img: "SƠ ĐỒ BPMN", caption: "Quy trình mới sau khi áp dụng AI." },
    { name: "Wireframe", img: "WIREFRAME", caption: "Phác thảo giao diện cho các luồng chính." },
  ],
  story: {
    id: "US-01",
    epic: "[TÊN EPIC]",
    priority: "CAO",
    role: "[vai trò]",
    action: "[hành động]",
    value: "[giá trị nhận được]",
    given: "[điều kiện ban đầu]",
    when: "[người dùng thực hiện hành động]",
    then: "[kết quả mong đợi, đo được]",
  },
  outcomes: ["[Kết quả 1]", "[Kết quả 2]", "[Phản hồi từ stakeholder]"],
  lessons: ["[Bài học 1]", "[Bài học 2]"],
};

export const projects: Project[] = [
  { ...base, slug: "tinh-nang-ai", cat: "AI", year: 2026, kind: "TÍNH NĂNG AI", img: "[ẢNH WIREFRAME]", chips: ["User story", "LLM", "Acceptance criteria"], featured: true },
  { ...base, slug: "toi-uu-quy-trinh", cat: "BA", year: 2025, kind: "TỐI ƯU QUY TRÌNH", img: "[ẢNH SƠ ĐỒ BPMN]", chips: ["BPMN", "BRD", "Stakeholder"], featured: true },
  { ...base, slug: "dashboard-kpi", cat: "DỮ LIỆU", year: 2025, kind: "DASHBOARD", img: "[ẢNH DASHBOARD]", chips: ["SQL", "KPI", "Wireframe"], featured: true },
  { ...base, slug: "chatbot", cat: "AI", year: 2025, kind: "CHATBOT", img: "[ẢNH LUỒNG CHATBOT]", chips: ["Prompt", "Use case", "Rủi ro AI"] },
  { ...base, slug: "product-backlog", cat: "BA", year: 2024, kind: "PRODUCT BACKLOG", img: "[ẢNH USER STORY MAP]", chips: ["Story map", "Backlog", "Jira"] },
  { ...base, slug: "tai-lieu-song-ngu", cat: "NGÔN NGỮ", year: 2026, kind: "TÀI LIỆU SONG NGỮ", img: "[ẢNH TÀI LIỆU]", chips: ["EN ⇄ VI", "Thuật ngữ IT", "中文"] },
];

export const projectFilters: { label: string; cat: Category | null }[] = [
  { label: "Tất cả", cat: null },
  { label: "BA", cat: "BA" },
  { label: "AI", cat: "AI" },
  { label: "Dữ liệu", cat: "DỮ LIỆU" },
  { label: "Ngôn ngữ", cat: "NGÔN NGỮ" },
];
