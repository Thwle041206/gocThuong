// "Hành trình ngôn ngữ" page. Update the levels below when you pass a new exam.

export const levels = {
  zhNow: 3, // HSK 1–6
  zhGoal: 5,
  enNow: "B2", // CEFR
  enGoal: "C1",
};

export const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
const enNowIdx = CEFR.indexOf(levels.enNow as (typeof CEFR)[number]) + 1;
const enGoalIdx = CEFR.indexOf(levels.enGoal as (typeof CEFR)[number]) + 1;

export type Status = "done" | "now" | "next";

export const channels = [
  { abbr: "in", name: "LinkedIn", what: "BA & IT · tiếng Anh, tiếng Việt", url: "#" },
  { abbr: "YT", name: "YouTube", what: "Nói tiếng Anh", url: "#" },
  { abbr: "小红书", name: "Xiaohongshu", what: "Nói & viết tiếng Trung", url: "#" },
];

export const roadmap: { st: Status; when: string; title: string; desc: string }[] = [
  { st: "done", when: "ĐÃ ĐẠT", title: `HSK ${levels.zhNow} · IELTS [x]`, desc: "Nền tảng đủ để làm việc với tài liệu tiếng Anh." },
  { st: "now", when: "HIỆN TẠI", title: "Dịch tài liệu IT", desc: "BRD, user story EN ⇄ VI trong dự án BA." },
  { st: "next", when: "[THÁNG/NĂM]", title: `HSK ${levels.zhGoal}`, desc: "Đọc tài liệu kỹ thuật và họp công việc bằng tiếng Trung." },
  { st: "next", when: "[NĂM]", title: "Phiên dịch họp công nghệ", desc: "EN ⇄ VI ⇄ 中文 cho họp sản phẩm, demo, workshop." },
];

export const languages = [
  {
    name: "中文",
    scale: "HSK 1–6",
    labels: ["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"],
    now: levels.zhNow,
    goal: levels.zhGoal,
    aria: `Tiếng Trung: HSK ${levels.zhNow}, mục tiêu HSK ${levels.zhGoal}`,
    nowText: `HSK ${levels.zhNow} · [tháng/năm]`,
    goalText: `HSK ${levels.zhGoal} · [tháng/năm]`,
    can: "[Ví dụ: giao tiếp công việc cơ bản, đọc email ngắn]",
    proof: "Xem chứng chỉ HSK →",
  },
  {
    name: "English",
    scale: "CEFR A1–C2",
    labels: [...CEFR],
    now: enNowIdx,
    goal: enGoalIdx,
    aria: `Tiếng Anh: ${levels.enNow}, mục tiêu ${levels.enGoal}`,
    nowText: `${levels.enNow} · IELTS [x]`,
    goalText: `${levels.enGoal} · [tháng/năm]`,
    can: "Họp với khách hàng nước ngoài, viết BRD và user story bằng tiếng Anh.",
    proof: "Xem chứng chỉ IELTS →",
  },
  {
    name: "Tiếng Việt",
    scale: "Bản ngữ",
    labels: ["", "", "", "", "", ""],
    now: 6,
    goal: 6,
    aria: "Tiếng Việt: bản ngữ",
    nowText: "Bản ngữ",
    goalText: "—",
    can: "Viết tài liệu nghiệp vụ, biên tập bản dịch sang tiếng Việt tự nhiên.",
    proof: "",
  },
];

export type Milestone = { id: string; st: Status; title: string; when: string; text: string; link?: string };

export const timeline: { key: "zh" | "en"; abbr: string; name: string; meta: string; items: Milestone[] }[] = [
  {
    key: "zh",
    abbr: "中文",
    name: "Tiếng Trung",
    meta: `Bắt đầu [tháng/năm] · HSK ${levels.zhNow} → HSK ${levels.zhGoal}`,
    items: [
      { id: "z1", st: "next", title: `Thi HSK ${levels.zhGoal}`, when: "Dự kiến [tháng/năm]", text: "Ôn theo giáo trình HSK chuẩn, luyện đề mỗi tuần. Mục tiêu đọc được tài liệu kỹ thuật và họp công việc bằng tiếng Trung." },
      { id: "z2", st: "now", title: "Học từ vựng IT tiếng Trung cho BA", when: "[tháng/năm] – Hiện tại", text: "Tự soạn bảng thuật ngữ BA/IT 3 ngôn ngữ và chia sẻ dần trên 小红书. Mỗi tuần thêm một nhóm thuật ngữ mới.", link: "Bảng thuật ngữ IT · EN ⇄ VI ⇄ 中文" },
      { id: "z3", st: "done", title: `Đạt HSK ${levels.zhNow}`, when: "[tháng/năm]", text: "[Điểm số] · [Nơi thi].", link: `Xem chứng chỉ HSK ${levels.zhNow}` },
    ],
  },
  {
    key: "en",
    abbr: "EN",
    name: "Tiếng Anh",
    meta: `Dùng trong công việc BA hằng ngày · ${levels.enNow} → ${levels.enGoal}`,
    items: [
      { id: "e1", st: "next", title: "Phiên dịch họp công nghệ EN ⇄ VI", when: "Dự kiến [năm]", text: "Nhận phiên dịch cho các buổi họp sản phẩm, demo và workshop giữa đội Việt Nam và đối tác nước ngoài." },
      { id: "e2", st: "now", title: "Dịch tài liệu IT EN ⇄ VI", when: "[tháng/năm] – Hiện tại", text: "Dịch BRD, user story và tài liệu sản phẩm trong các dự án BA. Mỗi bản dịch có ghi chú thuật ngữ đi kèm.", link: "Mẫu bản dịch user story" },
      { id: "e3", st: "done", title: "IELTS [điểm]", when: "[tháng/năm]", text: "Listening [x] · Reading [x] · Writing [x] · Speaking [x].", link: "Xem chứng chỉ IELTS" },
    ],
  },
];

type Col = { head: string; story: string; ac: string[] };
export type Sample = { id: string; label: string; note: string; en: Col; vi: Col; zh: Col; terms: [string, string, string][] };

export const samples: Sample[] = [
  {
    id: "us",
    label: "User story",
    note: "Bản dịch mẫu — thay bằng bản dịch của bạn.",
    en: {
      head: "ENGLISH · BẢN GỐC",
      story: "As a customer support agent, I want the AI assistant to suggest a reply draft based on the ticket history, so that I can respond to customers faster.",
      ac: [
        "Given a ticket with at least one previous message, when I open the ticket, then a suggested reply appears within 3 seconds.",
        "Given a suggested reply, when I edit it, then the original suggestion is kept in the history.",
      ],
    },
    vi: {
      head: "TIẾNG VIỆT",
      story: "Là nhân viên chăm sóc khách hàng, tôi muốn trợ lý AI gợi ý bản nháp trả lời dựa trên lịch sử ticket, để tôi phản hồi khách hàng nhanh hơn.",
      ac: [
        "Cho trước một ticket có ít nhất một tin nhắn trước đó, khi tôi mở ticket, thì bản trả lời gợi ý xuất hiện trong vòng 3 giây.",
        "Cho trước một bản gợi ý, khi tôi chỉnh sửa, thì bản gợi ý gốc vẫn được lưu trong lịch sử.",
      ],
    },
    zh: {
      head: "中文",
      story: "作为客服人员，我希望 AI 助手能根据工单历史推荐回复草稿，以便我更快地回复客户。",
      ac: ["假设工单中至少有一条历史消息，当我打开该工单时，推荐回复会在 3 秒内出现。", "假设已有推荐回复，当我对其进行编辑时，原始推荐仍保存在历史记录中。"],
    },
    terms: [
      ["user story", "câu chuyện người dùng", "用户故事"],
      ["acceptance criteria", "tiêu chí nghiệm thu", "验收标准"],
      ["ticket", "phiếu yêu cầu", "工单"],
      ["draft", "bản nháp", "草稿"],
    ],
  },
  {
    id: "rn",
    label: "Release note",
    note: "Chỗ trống cho mẫu dịch tiếp theo.",
    en: { head: "ENGLISH · BẢN GỐC", story: "[Đoạn release note tiếng Anh]", ac: [] },
    vi: { head: "TIẾNG VIỆT", story: "[Bản dịch tiếng Việt]", ac: [] },
    zh: { head: "中文", story: "[中文翻译]", ac: [] },
    terms: [],
  },
  {
    id: "em",
    label: "Email khách hàng",
    note: "Chỗ trống cho mẫu dịch tiếp theo.",
    en: { head: "ENGLISH · BẢN GỐC", story: "[Email gửi khách hàng]", ac: [] },
    vi: { head: "TIẾNG VIỆT", story: "[Bản dịch tiếng Việt]", ac: [] },
    zh: { head: "中文", story: "[中文翻译]", ac: [] },
    terms: [],
  },
];
