"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "vi" | "en" | "zh";
export const LANGS: { id: Lang; label: string }[] = [
  { id: "vi", label: "VI" },
  { id: "en", label: "EN" },
  { id: "zh", label: "中文" },
];

// Interface strings. Page content stays in Vietnamese until EN/中文 copies are written
// (Sprint 3 in the plan moves this to /en/ and /zh/ routes for SEO).
export const dict = {
  vi: {
    nav: { home: "TRANG CHỦ", projects: "DỰ ÁN", posts: "BÀI VIẾT", connect: "KẾT NỐI", contact: "LIÊN HỆ" },
    footer: { pages: "TRANG", contact: "LIÊN HỆ", home: "Trang chủ", projects: "Dự án", posts: "Bài viết", connect: "Kết nối", journey: "Hành trình ngôn ngữ" },
    hero: {
      eyebrow: "BUSINESS ANALYST · IT & AI · EN / 中文",
      headline: "Biến bài toán kinh doanh thành giải pháp AI rõ ràng.",
      sub: "Mình là Thương — BA mảng IT/AI, đang học tiếng Anh và tiếng Trung với mục tiêu trở thành phiên dịch viên.",
      cta1: "Xem dự án",
      cta2: "Liên hệ",
    },
    langGroup: "Ngôn ngữ",
  },
  en: {
    nav: { home: "HOME", projects: "PROJECTS", posts: "WRITING", connect: "RESOURCES", contact: "CONTACT" },
    footer: { pages: "PAGES", contact: "CONTACT", home: "Home", projects: "Projects", posts: "Writing", connect: "Resources", journey: "Language journey" },
    hero: {
      eyebrow: "BUSINESS ANALYST · IT & AI · EN / 中文",
      headline: "Turning business problems into clear AI solutions.",
      sub: "I'm Thương — a BA in IT/AI, learning English and Chinese on the way to becoming an interpreter.",
      cta1: "View projects",
      cta2: "Contact",
    },
    langGroup: "Language",
  },
  zh: {
    nav: { home: "首页", projects: "项目", posts: "文章", connect: "资源", contact: "联系" },
    footer: { pages: "页面", contact: "联系", home: "首页", projects: "项目", posts: "文章", connect: "资源", journey: "语言之旅" },
    hero: {
      eyebrow: "业务分析师 · IT 与 AI · EN / 中文",
      headline: "把业务问题变成清晰的 AI 方案。",
      sub: "我是 Thương，IT/AI 领域的业务分析师，正在学习英语和中文，目标是成为口译员。",
      cta1: "查看项目",
      cta2: "联系我",
    },
    langGroup: "语言",
  },
} as const;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (typeof dict)[Lang] };
const LangContext = createContext<Ctx>({ lang: "vi", setLang: () => {}, t: dict.vi });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("vi");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang") as Lang | null;
      if (saved && saved in dict) setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hans" : lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {}
  };

  return <LangContext.Provider value={{ lang, setLang, t: dict[lang] }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
