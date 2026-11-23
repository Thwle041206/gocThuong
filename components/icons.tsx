type P = { size?: number; color?: string };
const base = (size: number) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true as const });

export const ArrowRight = ({ size = 18 }: P) => (
  <svg {...base(size)} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const ArrowUpRight = ({ size = 14, color = "#6B6B6B" }: P) => (
  <svg {...base(size)} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8" /></svg>
);
export const Search = ({ size = 18 }: P) => (
  <svg {...base(size)} stroke="#6B6B6B" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
);
export const User = ({ size = 20 }: P) => (
  <svg {...base(size)} stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
);
export const Grid = ({ size = 18, color = "currentColor" }: P) => (
  <svg {...base(size)} stroke={color} strokeWidth="1.8"><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg>
);
export const List = ({ size = 18, color = "currentColor" }: P) => (
  <svg {...base(size)} stroke={color} strokeWidth="1.8" strokeLinecap="round"><rect x="4" y="5" width="6" height="5" rx="1" /><rect x="4" y="14" width="6" height="5" rx="1" /><path d="M13 7h7M13 16h7" /></svg>
);
export const Lines = ({ size = 18, color = "currentColor" }: P) => (
  <svg {...base(size)} stroke={color} strokeWidth="1.8" strokeLinecap="round"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
);
export const Plus = ({ size = 16 }: P) => (
  <svg {...base(size)} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
);
export const Heart = ({ size = 14, filled = false }: P & { filled?: boolean }) => (
  <svg {...base(size)} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
);
export const Copy = ({ size = 16 }: P) => (
  <svg {...base(size)} stroke="#111111" strokeWidth="1.8"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a1 1 0 0 1 1-1h9" /></svg>
);
export const Download = ({ size = 18 }: P) => (
  <svg {...base(size)} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
);
export const Share = ({ size = 18 }: P) => (
  <svg {...base(size)} stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg>
);
export const Bookmark = ({ size = 18, filled = false }: P & { filled?: boolean }) => (
  <svg {...base(size)} fill={filled ? "#FFFFFF" : "none"} stroke={filled ? "#FFFFFF" : "#111111"} strokeWidth="1.8" strokeLinejoin="round"><path d="M6 4h12v17l-6-4-6 4z" /></svg>
);
export const ThumbUp = ({ size = 16 }: P) => (
  <svg {...base(size)} stroke="#111111" strokeWidth="1.8" strokeLinejoin="round"><path d="M7 10v11H4V10zM7 10l4-7a2 2 0 0 1 3 2l-1 5h6a2 2 0 0 1 2 2.3l-1.4 7A2 2 0 0 1 17.6 21H7" /></svg>
);
export const ThumbDown = ({ size = 16 }: P) => (
  <svg {...base(size)} stroke="#111111" strokeWidth="1.8" strokeLinejoin="round"><path d="M17 14V3h3v11zM17 14l-4 7a2 2 0 0 1-3-2l1-5H5a2 2 0 0 1-2-2.3l1.4-7A2 2 0 0 1 6.4 3H17" /></svg>
);
