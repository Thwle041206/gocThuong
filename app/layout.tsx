import type { Metadata } from "next";
import { Be_Vietnam_Pro, Cormorant_Garamond, JetBrains_Mono, Noto_Serif_SC } from "next/font/google";
import { LangProvider } from "@/lib/i18n";
import { site } from "@/content/site";
import "./globals.css";

const sans = Be_Vietnam_Pro({ subsets: ["vietnamese", "latin"], weight: ["400", "500", "600"], variable: "--font-be-vietnam", display: "swap" });
const serif = Cormorant_Garamond({ subsets: ["vietnamese", "latin"], weight: ["500", "600"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["vietnamese", "latin"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" });
const sc = Noto_Serif_SC({ weight: ["500"], variable: "--font-noto-sc", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "góc Thương — BA · AI · Ngôn ngữ", template: "%s — góc Thương" },
  description: "Thương — Business Analyst mảng IT/AI. Dự án, bài viết và hành trình học tiếng Anh, tiếng Trung.",
  openGraph: { siteName: site.name, locale: "vi_VN", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${sans.variable} ${serif.variable} ${mono.variable} ${sc.variable}`}>
      <body>
        <LangProvider>
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
