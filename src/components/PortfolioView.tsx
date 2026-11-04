import { useState, useMemo, useRef } from 'react';
import {
  FileText,
  Globe,
  Upload,
  Download,
  Maximize2,
  ExternalLink,
  Sparkles,
  Award,
  CheckCircle2,
  Quote,
  Shield,
  ChevronRight,
  X,
  Briefcase,
  Target,
  Layers,
  Compass,
  ArrowUpRight,
  Copy,
  Check,
  Search,
  BookOpen,
} from 'lucide-react';
import { Language, WORK_PROJECTS, WorkProject } from '../data/content';
import { useCMS } from '../context/CMSContext';
import { DEFAULT_TYPOGRAPHY_SETTINGS } from '../services/cmsService';

interface PortfolioViewProps {
  lang: Language;
  onOpenContact: (defaultService?: string) => void;
}

// 8 Core Sections from HBR / Editorial Structure (image_a8b94866.png)
export interface PortfolioStep {
  id: string;
  num: number;
  title_vi: string;
  title_en: string;
  tagline_vi: string;
  tagline_en: string;
}

export const PORTFOLIO_STEPS: PortfolioStep[] = [
  {
    id: 'intro',
    num: 1,
    title_vi: 'Thông tin cá nhân & Giới thiệu',
    title_en: 'Personal Info & About Me',
    tagline_vi: 'Hồ sơ, chức danh, thế mạnh và liên hệ',
    tagline_en: 'Profile, title, strengths & contact',
  },
  {
    id: 'objectives',
    num: 2,
    title_vi: 'Mục tiêu nghề nghiệp',
    title_en: 'Career Objectives',
    tagline_vi: 'Mục tiêu ngắn hạn & dài hạn 3–5 năm',
    tagline_en: 'Short-term & 3-5 year roadmap',
  },
  {
    id: 'skills',
    num: 3,
    title_vi: 'Kỹ năng chuyên môn',
    title_en: 'Core Competencies',
    tagline_vi: 'Chứng minh qua dự án và số liệu thực tế',
    tagline_en: 'Proven through real projects & metrics',
  },
  {
    id: 'projects',
    num: 4,
    title_vi: 'Dự án / Sản phẩm tiêu biểu',
    title_en: 'Featured Projects',
    tagline_vi: 'Sản phẩm chọn lọc, vai trò và tác động',
    tagline_en: 'Selected works, roles & measurable impact',
  },
  {
    id: 'achievements',
    num: 5,
    title_vi: 'Thành tựu, Chứng chỉ, Giải thưởng',
    title_en: 'Certifications & Honors',
    tagline_vi: 'Chứng chỉ quốc tế, giải thưởng uy tín',
    tagline_en: 'Industry certs, awards & credentials',
  },
  {
    id: 'copyright',
    num: 6,
    title_vi: 'Thông tin bản quyền & Sở hữu',
    title_en: 'Intellectual Property Notice',
    tagline_vi: 'Bảo hộ bản quyền nội dung & thiết kế',
    tagline_en: 'Content & design rights protection',
  },
  {
    id: 'testimonials',
    num: 7,
    title_vi: 'Phản hồi từ Khách hàng & Quản lý',
    title_en: 'Testimonials & Endorsements',
    tagline_vi: 'Đánh giá chân thực từ người cộng tác',
    tagline_en: 'Authentic reviews from partners & mentors',
  },
  {
    id: 'philosophy',
    num: 8,
    title_vi: 'Phương châm làm việc & Định hướng',
    title_en: 'Work Philosophy & Values',
    tagline_vi: 'Giá trị sống, nguyên tắc và tính cách',
    tagline_en: 'Living values, ethics & personal drive',
  },
];

export function PortfolioView({ lang, onOpenContact }: PortfolioViewProps) {
  const isEn = lang === 'en';
  const { siteSettings, publishedProjects } = useCMS();
  const typography = siteSettings?.typography || DEFAULT_TYPOGRAPHY_SETTINGS;

  // View mode switcher: 'website' (text-based interactive portfolio) | 'pdf' (PDF view / upload)
  const [viewMode, setViewMode] = useState<'website' | 'pdf'>('website');

  // PDF Upload & State Management
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gocthuong_portfolio_pdf_url') || null;
    }
    return null;
  });
  const [pdfFileName, setPdfFileName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gocthuong_portfolio_pdf_name') || 'Portfolio_LeThiHoaiThuong.pdf';
    }
    return 'Portfolio_LeThiHoaiThuong.pdf';
  });
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string>('intro');
  const [selectedProjectModal, setSelectedProjectModal] = useState<WorkProject | null>(null);
  const [searchProjectQuery, setSearchProjectQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fallback or custom projects
  const allProjects = publishedProjects && publishedProjects.length > 0 ? publishedProjects : WORK_PROJECTS;

  // Handle PDF file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert(isEn ? 'Please choose a valid PDF file.' : 'Vui lòng chọn file định dạng PDF (.pdf).');
      return;
    }

    setIsUploadingPdf(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPdfDataUrl(result);
      setPdfFileName(file.name);
      try {
        localStorage.setItem('gocthuong_portfolio_pdf_url', result);
        localStorage.setItem('gocthuong_portfolio_pdf_name', file.name);
      } catch (err) {
        console.warn('Storage quota exceeded, PDF held in session memory:', err);
      }
      setIsUploadingPdf(false);
    };
    reader.onerror = () => {
      alert(isEn ? 'Error reading PDF file.' : 'Có lỗi khi đọc file PDF.');
      setIsUploadingPdf(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePdf = () => {
    setPdfDataUrl(null);
    try {
      localStorage.removeItem('gocthuong_portfolio_pdf_url');
      localStorage.removeItem('gocthuong_portfolio_pdf_name');
    } catch {
      // ignore
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('lethihoaithuong06122004@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const scrollToSection = (id: string) => {
    setActiveStepId(id);
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filter projects in Section 4
  const filteredProjects = useMemo(() => {
    if (!searchProjectQuery.trim()) return allProjects;
    const q = searchProjectQuery.toLowerCase();
    return allProjects.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const titleVi = (p.title?.vi || '').toLowerCase();
      const titleEn = (p.title?.en || '').toLowerCase();
      const descVi = (p.description?.vi || '').toLowerCase();
      const descEn = (p.description?.en || '').toLowerCase();
      const client = (p.client || '').toLowerCase();
      return name.includes(q) || titleVi.includes(q) || titleEn.includes(q) || descVi.includes(q) || descEn.includes(q) || client.includes(q);
    });
  }, [allProjects, searchProjectQuery]);

  return (
    <div className="animate-in fade-in duration-300 pb-20">
      {/* ============================================================ */}
      {/* SECTION 1: HEADER BANNER & 2-MODE SWITCHER (PRACTICAL STYLE)  */}
      {/* ============================================================ */}
      <section className="px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-7 max-w-[1360px] mx-auto border-b border-zinc-200/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6">
          <div>
            {/* Editorial Kicker */}
            <div className="flex items-center gap-2 text-[11px] font-mono font-semibold tracking-wider uppercase text-zinc-400 mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
              <span>{isEn ? 'PORTFOLIO ARCHIVE' : 'HỒ SƠ NĂNG LỰC CÁ NHÂN'}</span>
              <span className="text-zinc-300">•</span>
              <span className="text-zinc-500">LÊ THỊ HOÀI THƯƠNG</span>
            </div>

            {/* Main Editorial H1 (Matching article page style) */}
            <h1
              style={{
                fontFamily: typography.h1FontFamily,
                fontSize: typography.h1CustomPx ? `clamp(29px, 6.4vw, ${Math.round(typography.h1CustomPx * 0.8)}px)` : undefined,
              }}
              className="font-serif text-[32px] leading-[1.15] xs:text-[48px] sm:text-[58px] md:text-[77px] font-normal text-zinc-900 tracking-tight sm:leading-none mb-3"
            >
              {isEn ? 'Personal Portfolio' : 'Hồ sơ năng lực cá nhân'}
            </h1>

            <p className="text-zinc-600 text-xs sm:text-sm md:text-[15px] max-w-2xl font-sans leading-relaxed">
              {isEn
                ? 'Curated showcase of creative works, editorial thinking, professional skills, and verified impact.'
                : 'Tổng hợp quá trình thực hiện dự án, sản phẩm sáng tạo, kỹ năng chuyên môn và kết quả cụ thể theo chuẩn mực quốc tế.'}
            </p>
          </div>

          {/* Practical 2-mode Switcher */}
          <div className="flex items-center gap-1.5 bg-zinc-100/90 p-1 rounded-xl border border-zinc-200/80 shadow-2xs self-start md:self-end">
            <button
              type="button"
              onClick={() => setViewMode('website')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                viewMode === 'website'
                  ? 'bg-white text-zinc-950 shadow-2xs border border-zinc-200/90'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Globe size={14} className={viewMode === 'website' ? 'text-zinc-950' : 'text-zinc-400'} />
              <span>{isEn ? 'Website View' : 'Dạng chữ Website'}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('pdf')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                viewMode === 'pdf'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <FileText size={14} className={viewMode === 'pdf' ? 'text-white' : 'text-zinc-400'} />
              <span>{isEn ? 'PDF View' : 'Xem dạng PDF'}</span>
              {pdfDataUrl && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          </div>
        </div>

        {/* Editorial Note: CV vs Portfolio (Practical minimal note bar) */}
        <div className="mt-6 border-l-2 border-zinc-900 bg-zinc-50/90 rounded-r-xl p-3.5 sm:p-4 text-xs sm:text-[13px] text-zinc-600 leading-relaxed font-sans flex flex-col md:flex-row gap-3 md:items-center justify-between border-y border-r border-zinc-200/60">
          <div className="flex items-start gap-2.5">
            <BookOpen size={16} className="text-zinc-700 shrink-0 mt-0.5" />
            <p>
              <strong className="text-zinc-900 font-medium">
                {isEn ? 'CV vs Portfolio: ' : 'Phân biệt CV và Portfolio: '}
              </strong>
              {isEn
                ? 'A CV summarizes learning, experience, and skills. A Portfolio goes deeper by presenting actual products, process, and verified metrics.'
                : 'CV tóm tắt quá trình học tập, kinh nghiệm, kỹ năng và thành tựu. Portfolio đi sâu hơn bằng cách trình bày sản phẩm, dự án, quy trình thực hiện và kết quả cụ thể.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenContact('Hợp tác dự án')}
            className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-black transition-colors cursor-pointer inline-flex items-center gap-1.5 self-start md:self-center"
          >
            <span>{isEn ? 'Contact' : 'Liên hệ hợp tác'}</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </section>

      {/* ============================================================ */}
      {/* DIV 1: WEBSITE DẠNG CHỮ / INTERACTIVE PRACTICAL OUTLINE      */}
      {/* ============================================================ */}
      {viewMode === 'website' && (
        <div className="animate-in fade-in duration-200 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-7 sm:pt-9">
          {/* ------------------------------------------------------------ */}
          {/* 8 PRACTICAL CARDS ROADMAP (Matching article / work card style)*/}
          {/* ------------------------------------------------------------ */}
          <div className="mb-14 sm:mb-16">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-400">
                  {isEn ? 'PORTFOLIO OUTLINE (8 PHẦN CHUẨN)' : 'CẤU TRÚC PORTFOLIO (8 PHẦN CHUẨN)'}
                </span>
                <span className="text-zinc-300">•</span>
                <span className="text-xs text-zinc-500 font-sans">
                  {isEn ? 'Click any card to jump directly' : 'Bấm vào từng ô để xem nhanh mục tương ứng'}
                </span>
              </div>
            </div>

            {/* 8 Practical Editorial Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PORTFOLIO_STEPS.map((step) => {
                const isActive = activeStepId === step.id;

                return (
                  <div
                    key={step.id}
                    onClick={() => scrollToSection(step.id)}
                    className={`group cursor-pointer bg-white hover:bg-zinc-50/80 border rounded-xl p-3.5 sm:p-4 transition-all duration-200 shadow-2xs hover:shadow-xs flex flex-col justify-between ${
                      isActive
                        ? 'border-zinc-900 ring-1 ring-zinc-900/10 bg-zinc-50/50'
                        : 'border-zinc-200/90 hover:border-zinc-400'
                    }`}
                  >
                    <div>
                      {/* Top row: Step number + subtle action arrow */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-serif text-xl sm:text-2xl font-normal text-zinc-400 group-hover:text-zinc-900 transition-colors">
                          0{step.num}
                        </span>
                        <ArrowUpRight
                          size={13}
                          className="text-zinc-300 group-hover:text-zinc-900 transition-colors"
                        />
                      </div>

                      {/* Step Title in Editorial Serif */}
                      <h3 className="font-serif text-sm sm:text-[15px] font-normal text-zinc-900 leading-snug group-hover:text-zinc-600 transition-colors line-clamp-1 mb-1">
                        {isEn ? step.title_en : step.title_vi}
                      </h3>

                      {/* Subtitle / Excerpt in clean sans */}
                      <p className="text-[11px] text-zinc-500 font-sans leading-relaxed line-clamp-2">
                        {isEn ? step.tagline_en : step.tagline_vi}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>PHẦN 0{step.num}</span>
                      <span className="text-zinc-500 group-hover:text-zinc-900 transition-colors font-sans">
                        Xem chi tiết →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* 2.1 THÔNG TIN CÁ NHÂN & PHẦN GIỚI THIỆU                     */}
          {/* ------------------------------------------------------------ */}
          <section id="section-intro" className="mb-14 sm:mb-16 pt-2 scroll-mt-20">
            <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs p-5 sm:p-8 relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
                {/* Profile Portrait (Styled like ArticleCard thumbnail) */}
                <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div className="relative aspect-[4/3] sm:aspect-square w-48 sm:w-56 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200/80 shadow-xs mb-4">
                    <img
                      src="/src/assets/images/creative_man_notebook_1790135085678.jpg"
                      alt="Lê Thị Hoài Thương"
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-black/85 text-white">
                        góc Thương
                      </span>
                    </div>
                  </div>

                  <h3 className="font-serif text-2xl font-normal text-zinc-900">
                    Lê Thị Hoài Thương
                  </h3>
                  <p className="text-zinc-500 text-xs sm:text-[13px] font-sans mt-0.5">
                    Editorial Creator & Brand Strategist
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="text-[11px] bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded font-mono">
                      Hà Nội / Toàn quốc
                    </span>
                    <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200/70 px-2.5 py-0.5 rounded font-semibold">
                      🟢 Sẵn sàng hợp tác
                    </span>
                  </div>
                </div>

                {/* Right Bio, Contact & Core Values */}
                <div className="lg:col-span-8">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-400 mb-2">
                    <span>PHẦN 01</span>
                    <span>·</span>
                    <span>THÔNG TIN CÁ NHÂN & GIỚI THIỆU BẢN THÂN</span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-900 mb-3.5 leading-snug">
                    Kiến tạo giá trị thực qua từng câu chữ, chiến lược nội dung và trải nghiệm thị giác.
                  </h2>

                  <div className="space-y-3 text-zinc-600 text-xs sm:text-sm leading-relaxed font-sans">
                    <p>
                      Xin chào, mình là <strong>Thương Lê</strong> — người sáng lập không gian số{' '}
                      <strong>góc Thương (gocthuong.com)</strong>. Với hơn 3 năm làm việc trong lĩnh vực sản xuất nội dung,
                      chiến lược truyền thông số và thiết kế biên tập ấn phẩm, mình đồng hành cùng các thương hiệu cá nhân,
                      studio sáng tạo và tổ chức nhằm truyền tải những thông điệp có chiều sâu và tính chuyển đổi bền vững.
                    </p>
                    <p>
                      Thế mạnh nổi bật là sự kết hợp giữa <em>tư duy nghiên cứu độc giả sắc bén</em>, <em>cảm quan nghệ thuật chữ chuẩn mực</em> và <em>kỷ luật triển khai dự án</em>. Không dừng lại ở việc tạo ra các con chữ bắt mắt, mục tiêu của mình là giải quyết bài toán giao tiếp giữa thương hiệu và con người.
                    </p>
                  </div>

                  {/* Compact Practical Contact Row */}
                  <div className="mt-6 pt-5 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="bg-zinc-50/90 p-3 rounded-xl border border-zinc-200/70">
                      <div className="text-[10px] font-mono text-zinc-400 uppercase font-semibold mb-0.5">
                        EMAIL LIÊN HỆ
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-medium text-zinc-900 truncate">
                          lethihoaithuong06122004@gmail.com
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyEmail}
                          className="text-zinc-500 hover:text-zinc-900 p-0.5 cursor-pointer"
                          title="Sao chép email"
                        >
                          {copiedEmail ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-zinc-50/90 p-3 rounded-xl border border-zinc-200/70">
                      <div className="text-[10px] font-mono text-zinc-400 uppercase font-semibold mb-0.5">
                        WEBSITE CHÍNH THỨC
                      </div>
                      <a
                        href="https://gocthuong.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-zinc-900 hover:underline inline-flex items-center gap-1"
                      >
                        <span>gocthuong.com</span>
                        <ExternalLink size={11} className="text-zinc-400" />
                      </a>
                    </div>

                    <div className="bg-zinc-50/90 p-3 rounded-xl border border-zinc-200/70">
                      <div className="text-[10px] font-mono text-zinc-400 uppercase font-semibold mb-0.5">
                        MÃ NGUỒN DỰ ÁN
                      </div>
                      <a
                        href="https://github.com/Thwle041206/gocThuong"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-zinc-900 hover:underline inline-flex items-center gap-1"
                      >
                        <span>GitHub Repository</span>
                        <ExternalLink size={11} className="text-zinc-400" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------------ */}
          {/* 2.2 MỤC TIÊU NGHỀ NGHIỆP                                     */}
          {/* ------------------------------------------------------------ */}
          <section id="section-objectives" className="mb-14 sm:mb-16 pt-2 scroll-mt-20">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
              <div>
                <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-400 mb-1">
                  PHẦN 02 · MỤC TIÊU NGHỀ NGHIỆP
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-900">
                  Định hướng phát triển & Cam kết giá trị
                </h2>
              </div>
              <p className="text-zinc-500 text-xs font-sans max-w-sm text-right hidden sm:block">
                Lộ trình rõ ràng với mục tiêu tạo ra tác động đo lường được cho tổ chức và đối tác.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Short-term goal */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-zinc-900 text-white">
                    MỤC TIÊU NGẮN HẠN (1–2 NĂM)
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">Lead Specialist</span>
                </div>
                <h3 className="font-serif text-xl text-zinc-900 font-normal mb-3">
                  Content Lead & Creative Specialist
                </h3>
                <ul className="space-y-2.5 text-zinc-600 text-xs sm:text-[13px] leading-relaxed font-sans">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-zinc-800 shrink-0 mt-0.5" />
                    <span>Xây dựng chiến lược nội dung tổng thể cho các ấn phẩm số, chiến dịch truyền thông đa kênh và sản phẩm số.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-zinc-800 shrink-0 mt-0.5" />
                    <span>Thiết lập chuẩn mực giọng văn thương hiệu (Tone & Voice), tối ưu chuyển đổi qua email marketing và bài viết chuyên sâu.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-zinc-800 shrink-0 mt-0.5" />
                    <span>Đo lường hiệu quả bằng các chỉ số tương tác thực tế (Organic Reach, Engagement, Retention Rate).</span>
                  </li>
                </ul>
              </div>

              {/* Long-term goal */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200/60">
                    MỤC TIÊU DÀI HẠN (3–5 NĂM)
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">Creative Direction</span>
                </div>
                <h3 className="font-serif text-xl text-zinc-900 font-normal mb-3">
                  Creative Director & Editorial Strategist
                </h3>
                <ul className="space-y-2.5 text-zinc-600 text-xs sm:text-[13px] leading-relaxed font-sans">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-zinc-800 shrink-0 mt-0.5" />
                    <span>Dẫn dắt các chiến dịch nội dung sáng tạo quy mô lớn, kết hợp chặt chẽ giữa nội dung nghệ thuật, giao diện trải nghiệm người dùng và công nghệ web hiện đại.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-zinc-800 shrink-0 mt-0.5" />
                    <span>Phát triển góc Thương thành nền tảng chia sẻ tư liệu & truyền cảm hứng uy tín cho thế hệ người làm sáng tạo trẻ Việt Nam.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-zinc-800 shrink-0 mt-0.5" />
                    <span>Đồng hành cùng các thương hiệu Việt định hình bản sắc độc bản vươn tầm tiêu chuẩn quốc tế.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------------ */}
          {/* 2.3 KỸ NĂNG CHUYÊN MÔN (PRACTICAL 2-LINE FORMAT)            */}
          {/* ------------------------------------------------------------ */}
          <section id="section-skills" className="mb-14 sm:mb-16 pt-2 scroll-mt-20">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
              <div>
                <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-400 mb-1">
                  PHẦN 03 · KỸ NĂNG CHUYÊN MÔN
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-900">
                  Năng lực thực chứng gắn liền với kết quả
                </h2>
              </div>
              <p className="text-zinc-500 text-xs font-sans max-w-sm text-right hidden sm:block">
                Không dùng biểu đồ phần trăm tự chấm điểm. Mỗi kỹ năng gắn kèm dự án và số liệu thực tế.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  title: 'Content Strategy & Sáng tạo nội dung',
                  desc: 'Biên soạn bài viết chuyên khảo, kịch bản video, newsletter và nội dung giao diện sản phẩm.',
                  project: 'Chuỗi 12+ bài viết sâu trên góc Thương & Email Marketing',
                  result: 'Tỷ lệ mở email 42.8% (chuẩn ngành 21%), thời gian đọc TB 4m15s',
                  tags: ['Editorial', 'Copywriting'],
                },
                {
                  title: 'Thiết kế thị giác & Hệ thống nhận diện',
                  desc: 'Bố cục tạp chí, tài sản thương hiệu số, áp dụng nguyên tắc typography và trật tự thị giác.',
                  project: 'Thiết kế Design System cho trang web & ấn phẩm góc Thương',
                  result: '100% tài sản truyền thông được quy chuẩn; hơn 8,500 lượt tương tác ấn phẩm',
                  tags: ['Figma', 'Typography'],
                },
                {
                  title: 'SEO & Cấu trúc thông tin (IA)',
                  desc: 'Nghiên cứu từ khóa hành vi, phân cấp luồng đọc thông tin, tối ưu hóa công cụ tìm kiếm chuẩn UX.',
                  project: 'Chiến lược từ khóa tự nhiên cho nền tảng xuất bản',
                  result: 'Tăng trưởng +185% organic traffic sau 4 tháng triển khai',
                  tags: ['SEO', 'UX Writing'],
                },
                {
                  title: 'Dựng video ngắn & Kịch bản Reels/TikTok',
                  desc: 'Xây dựng kịch bản có hook lôi cuốn, định hướng hình ảnh và storyboard truyền tải thông điệp nhanh.',
                  project: 'Series video ngắn "Góc đọc sách & Không gian sáng tạo"',
                  result: '250,000+ lượt xem tự nhiên, tỷ lệ lưu lại bài viết (save rate) 6.4%',
                  tags: ['Short-form', 'Hook Crafting'],
                },
                {
                  title: 'Quản lý dự án sáng tạo & Điều phối',
                  desc: 'Lập kế hoạch nội dung, phối hợp cùng lập trình viên, nhà thiết kế và đối tác ra mắt sản phẩm đúng hạn.',
                  project: 'Phối hợp phát triển kho tài nguyên Mindmap cộng đồng',
                  result: 'Bàn giao đúng tiến độ 100%, quy trình làm việc minh bạch không lỗi giao tiếp',
                  tags: ['Agile', 'Cross-functional'],
                },
                {
                  title: 'Nghiên cứu văn hoá & Thấu cảm người dùng',
                  desc: 'Phân tích tâm lý tiếp nhận thông tin của độc giả trẻ, chuyển hóa dữ liệu khảo sát thành góc nhìn nội dung mới.',
                  project: 'Khảo sát nhu cầu chia sẻ tài liệu học tập của sinh viên & freelancer',
                  result: 'Thu thập 300+ phản hồi thực tế định hình trực tiếp tính năng chia sẻ tài liệu',
                  tags: ['Research', 'Insights'],
                },
              ].map((skill, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-4 border border-zinc-200/80 hover:border-zinc-400 transition-all shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-serif text-base font-normal text-zinc-900 leading-snug">
                        {skill.title}
                      </h3>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 shrink-0">
                        {skill.tags[0]}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-xs font-sans leading-relaxed mb-3">
                      {skill.desc}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-zinc-100 text-xs font-sans space-y-1">
                    <div className="text-zinc-600 text-[11px]">
                      <strong className="text-zinc-800">Dự án:</strong> {skill.project}
                    </div>
                    <div className="text-[11px] text-zinc-900 font-mono bg-zinc-50 px-2 py-1 rounded">
                      🎯 <strong>Kết quả:</strong> {skill.result}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ------------------------------------------------------------ */}
          {/* 2.4 CÁC DỰ ÁN TIÊU BIỂU (EXACT ARTICLECARD FORMAT)           */}
          {/* ------------------------------------------------------------ */}
          <section id="section-projects" className="mb-14 sm:mb-16 pt-2 scroll-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 pb-2 border-b border-zinc-100">
              <div>
                <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-400 mb-1">
                  PHẦN 04 · CÁC DỰ ÁN & SẢN PHẨM TIÊU BIỂU
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-900">
                  Dự án chọn lọc thể hiện năng lực thực tế
                </h2>
              </div>

              {/* Practical search box */}
              <div className="relative w-full sm:w-64">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchProjectQuery}
                  onChange={(e) => setSearchProjectQuery(e.target.value)}
                  placeholder={isEn ? 'Filter projects...' : 'Tìm kiếm dự án...'}
                  className="w-full pl-8 pr-7 py-1.5 bg-zinc-50 rounded-lg border border-zinc-200 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
                {searchProjectQuery && (
                  <button
                    onClick={() => setSearchProjectQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* 3-Column Editorial Grid matching ArticleCard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredProjects.slice(0, 6).map((project, idx) => (
                <article
                  key={project.id}
                  onClick={() => setSelectedProjectModal(project)}
                  className="group cursor-pointer flex flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900 rounded-2xl"
                >
                  {/* Image Container matching ArticleCard.tsx */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200/60 shadow-2xs">
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />

                    {/* Top-Right Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded bg-black/85 text-white select-none">
                        {project.categoryBadge || 'PROJECT 0' + (idx + 1)}
                      </span>
                    </div>

                    {/* Hover Overlay Button */}
                    <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <div className="w-full bg-black/90 backdrop-blur-xs text-white text-center py-2 px-3 rounded-lg text-[11px] font-medium tracking-[0.14em] uppercase flex items-center justify-center gap-1.5 shadow-lg">
                        <span>XEM CHI TIẾT HỒ SƠ</span>
                        <ArrowUpRight size={13} className="text-zinc-300" />
                      </div>
                    </div>
                  </div>

                  {/* Article/Project Content Below Image */}
                  <div className="pt-3 pb-1 flex flex-col flex-1">
                    {/* Title in Serif font */}
                    <h3 className="font-serif text-lg sm:text-xl font-normal leading-[1.3] text-zinc-900 group-hover:text-zinc-600 transition-colors line-clamp-1">
                      {project.name}
                    </h3>

                    {/* Subtitle / Excerpt in muted sans */}
                    <p className="mt-1 text-xs sm:text-[13px] text-zinc-500 font-sans leading-relaxed line-clamp-2">
                      {typeof project.title === 'object'
                        ? (isEn ? project.title.en : project.title.vi)
                        : project.title}
                    </p>

                    {/* Unboxed Metadata (Anti-slop clean typographic footer) */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-zinc-400 font-sans flex-wrap">
                      <span className="text-zinc-600 font-medium">{project.client || 'góc Thương'}</span>
                      <span aria-hidden="true" className="text-zinc-300">·</span>
                      <span>{project.timeline || '2024'}</span>
                      <span aria-hidden="true" className="text-zinc-300">·</span>
                      <span>{project.deliverables?.length || 3} hạng mục</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ------------------------------------------------------------ */}
          {/* 2.5 THÀNH TỰU, CHỨNG CHỈ, GIẢI THƯỞNG                       */}
          {/* ------------------------------------------------------------ */}
          <section id="section-achievements" className="mb-14 sm:mb-16 pt-2 scroll-mt-20">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
              <div>
                <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-400 mb-1">
                  PHẦN 05 · THÀNH TỰU, CHỨNG CHỈ & GIẢI THƯỞNG
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-900">
                  Chứng chỉ chuyên ngành & Thành tích ghi nhận
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  issuer: 'HubSpot Academy',
                  title: 'Content Marketing Certification',
                  year: '2024',
                  desc: 'Chiến lược Inbound Content, phân tích hành trình khách hàng & chuyển đổi.',
                  badge: 'QUỐC TẾ',
                },
                {
                  issuer: 'Google Digital Garage',
                  title: 'The Fundamentals of Digital Marketing',
                  year: '2023',
                  desc: 'Kiến thức nền tảng SEO, quảng cáo hiển thị & dữ liệu phân tích web.',
                  badge: 'GOOGLE',
                },
                {
                  issuer: 'IELTS Academic',
                  title: 'IELTS 7.5 Overall (Reading 8.5 / Writing 7.0)',
                  year: '2023',
                  desc: 'Khả năng nghiên cứu tài liệu quốc tế và biên dịch nội dung song ngữ chuẩn mực.',
                  badge: 'NGÔN NGỮ',
                },
                {
                  issuer: 'Học thuật & Sáng tạo',
                  title: 'Giải thưởng Cây bút Trẻ 2023',
                  year: '2023',
                  desc: 'Ghi nhận bài viết chuyên luận có tầm ảnh hưởng tích cực trong cộng đồng sinh viên.',
                  badge: 'GIẢI THƯỞNG',
                },
              ].map((cert, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-xl border border-zinc-200/80 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                        {cert.badge}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">{cert.year}</span>
                    </div>
                    <h4 className="font-serif text-base font-normal text-zinc-900 mb-1 leading-snug">
                      {cert.title}
                    </h4>
                    <p className="text-[11px] font-sans font-medium text-zinc-500 mb-1.5">
                      {cert.issuer}
                    </p>
                    <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                      {cert.desc}
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                    <CheckCircle2 size={12} />
                    <span>Đã xác minh</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ------------------------------------------------------------ */}
          {/* 2.6 THÔNG TIN BẢO HỘ QUYỀN SỞ HỮU TRÍ TUỆ                   */}
          {/* ------------------------------------------------------------ */}
          <section id="section-copyright" className="mb-14 sm:mb-16 pt-2 scroll-mt-20">
            <div className="bg-zinc-950 text-white rounded-2xl p-6 sm:p-8 border border-zinc-800 shadow-md">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-400 mb-3">
                <Shield size={12} className="text-white" />
                <span>PHẦN 06 · BẢO HỘ BẢN QUYỀN & QUYỀN SỞ HỮU TRÍ TUỆ</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-white mb-3">
                Cam kết tính độc bản & Quyền sở hữu nội dung
              </h2>

              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-sans mb-4 max-w-3xl">
                “Tất cả hình ảnh, bài viết, cấu trúc dự án và nội dung trong Portfolio này thuộc sở hữu cá nhân của{' '}
                <strong className="text-white">Lê Thị Hoài Thương (góc Thương)</strong>. Vui lòng không sao chép, trích dẫn sai lệch hoặc sử dụng cho mục đích thương mại khi chưa có sự đồng ý bằng văn bản.”
              </p>

              <div className="text-[11px] text-zinc-500 font-mono">
                Thể hiện tính liêm chính học thuật và sự tôn trọng luật bản quyền trong ngành sáng tạo số.
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------------ */}
          {/* 2.7 PHẢN HỒI TỪ KHÁCH HÀNG, ĐỐI TÁC, QUẢN LÝ                */}
          {/* ------------------------------------------------------------ */}
          <section id="section-testimonials" className="mb-14 sm:mb-16 pt-2 scroll-mt-20">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
              <div>
                <div className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-400 mb-1">
                  PHẦN 07 · PHẢN HỒI TỪ KHÁCH HÀNG & QUẢN LÝ
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-900">
                  Đánh giá thực tế từ người đồng hành
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  quote:
                    'Thương có khả năng tiếp nhận đề bài rất nhanh và biến những yêu cầu trừu tượng thành câu chữ sắc bén, có chiều sâu văn hoá hiếm thấy ở các bạn trẻ.',
                  author: 'Nguyễn Hoàng Minh',
                  role: 'Creative Lead · Studio Ấn phẩm',
                  avatar: '/src/assets/images/team_david_brown_1790135150592.jpg',
                },
                {
                  quote:
                    'Điểm mình ấn tượng nhất là tính kỷ luật và sự tỉ mỉ. Toàn bộ tài liệu bàn giao đều đúng hẹn, kèm theo số liệu phân tích rõ ràng và đề xuất cải tiến thiết thực.',
                  author: 'Trần Thị Thu Trang',
                  role: 'Brand Manager · Lifestyle Brand',
                  avatar: '/src/assets/images/team_sarah_lee_1790135127741.jpg',
                },
                {
                  quote:
                    'Một cộng sự sáng tạo đáng tin cậy. Dù là bài viết học thuật hay kịch bản video viral, Thương đều giữ được sự chỉn chu và tôn trọng khán giả.',
                  author: 'Lê Minh Tuấn',
                  role: 'Giảng viên & Cố vấn Truyền thông',
                  avatar: '/src/assets/images/team_emil_johnson_1790135108227.jpg',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-5 border border-zinc-200/80 shadow-2xs flex flex-col justify-between"
                >
                  <p className="text-zinc-700 text-xs sm:text-[13px] leading-relaxed font-serif italic mb-4">
                    “{item.quote}”
                  </p>
                  <div className="flex items-center gap-2.5 pt-3 border-t border-zinc-100">
                    <img
                      src={item.avatar}
                      alt={item.author}
                      className="w-8 h-8 rounded-full object-cover border border-zinc-200"
                    />
                    <div>
                      <h4 className="font-sans font-semibold text-xs text-zinc-900">
                        {item.author}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-sans">
                        {item.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ------------------------------------------------------------ */}
          {/* 2.8 PHƯƠNG CHÂM LÀM VIỆC & ĐỊNH HƯỚNG CÁ NHÂN               */}
          {/* ------------------------------------------------------------ */}
          <section id="section-philosophy" className="mb-10 pt-2 scroll-mt-20">
            <div className="border-l-2 border-zinc-900 bg-zinc-50/90 rounded-r-2xl p-6 sm:p-8 border-y border-r border-zinc-200/70">
              <div className="flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-400 mb-2">
                <span>PHẦN 08 · PHƯƠNG CHÂM LÀM VIỆC & ĐỊNH HƯỚNG CÁ NHÂN</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-2xl">
                  <h2 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-900 mb-2.5">
                    “Làm việc bằng sự tử tế, tạo giá trị bằng sự tận tâm.”
                  </h2>
                  <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed font-sans mb-4">
                    Mỗi dự án dù lớn hay nhỏ đều xứng đáng nhận được 100% năng lượng, sự trung thực trong ngôn từ và sự tỉ mỉ trong từng quyết định thiết kế. Mình luôn giữ tư duy học hỏi không ngừng, xem việc lắng nghe và cải tiến liên tục là kim chỉ nam cho sự phát triển nghề nghiệp lâu dài.
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs font-mono text-zinc-700">
                    <span className="px-2.5 py-1 rounded bg-white border border-zinc-200">
                      Tận tâm (Dedication)
                    </span>
                    <span className="px-2.5 py-1 rounded bg-white border border-zinc-200">
                      Tinh gọn (Clarity)
                    </span>
                    <span className="px-2.5 py-1 rounded bg-white border border-zinc-200">
                      Thấu hiểu (Empathy)
                    </span>
                    <span className="px-2.5 py-1 rounded bg-white border border-zinc-200">
                      Trách nhiệm (Integrity)
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenContact('Hợp tác dự án')}
                    className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white hover:bg-black font-semibold text-xs tracking-wide transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Cùng thảo luận dự án mới</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIEW 2: PDF DOCUMENT VIEW & UPLOAD CONTAINER                 */}
      {/* ============================================================ */}
      {viewMode === 'pdf' && (
        <div className="animate-in fade-in duration-200 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-7 sm:pt-9">
          {/* PDF Toolbar */}
          <div className="bg-white rounded-xl border border-zinc-200/90 shadow-2xs p-3.5 mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="font-sans font-semibold text-xs sm:text-sm text-zinc-900 flex items-center gap-2">
                  <span>{pdfFileName}</span>
                  {pdfDataUrl && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      ĐÃ TẢI LÊN
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-zinc-500">
                  {pdfDataUrl
                    ? 'Tài liệu PDF lưu trữ sẵn sàng để xem trực tiếp hoặc tải về'
                    : 'Chưa có file PDF nào được tải lên. Bạn có thể tải file PDF portfolio lên bên dưới.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,application/pdf"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPdf}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-black text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Upload size={13} />
                <span>{pdfDataUrl ? 'Tải lên bản PDF mới' : 'Tải lên file PDF'}</span>
              </button>

              {pdfDataUrl && (
                <>
                  <a
                    href={pdfDataUrl}
                    download={pdfFileName}
                    className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Tải về</span>
                  </a>

                  <a
                    href={pdfDataUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Maximize2 size={13} />
                    <span>Toàn màn hình</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleRemovePdf}
                    className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors cursor-pointer"
                    title="Xóa PDF hiện tại"
                  >
                    Xóa
                  </button>
                </>
              )}
            </div>
          </div>

          {/* PDF Viewer Box or Dropzone */}
          {pdfDataUrl ? (
            <div className="bg-zinc-950 rounded-2xl p-2 sm:p-3 shadow-xl border border-zinc-800 overflow-hidden">
              <div className="w-full h-[750px] sm:h-[850px] rounded-xl overflow-hidden bg-zinc-950 flex flex-col">
                <object
                  data={pdfDataUrl}
                  type="application/pdf"
                  className="w-full h-full rounded-xl"
                >
                  <iframe
                    src={pdfDataUrl}
                    title="Portfolio PDF"
                    className="w-full h-full rounded-xl border-0"
                  >
                    <div className="p-8 text-center text-white">
                      <p className="mb-4">Trình duyệt không hỗ trợ xem trực tiếp file PDF.</p>
                      <a
                        href={pdfDataUrl}
                        download={pdfFileName}
                        className="px-4 py-2 bg-white text-black rounded-lg font-bold"
                      >
                        Tải về máy để xem
                      </a>
                    </div>
                  </iframe>
                </object>
              </div>
            </div>
          ) : (
            /* Upload Dropzone / Placeholder */
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const input = fileInputRef.current;
                  if (input) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    input.files = dataTransfer.files;
                    handleFileUpload({ target: input } as any);
                  }
                }
              }}
              className="border border-dashed border-zinc-300 hover:border-zinc-900 bg-zinc-50/70 hover:bg-zinc-100/50 rounded-2xl p-12 sm:p-16 text-center transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-xl bg-white border border-zinc-200/80 shadow-2xs flex items-center justify-center mx-auto mb-3.5 group-hover:scale-105 transition-all">
                <Upload size={24} className="text-zinc-400 group-hover:text-zinc-900 transition-colors" />
              </div>

              <h3 className="font-serif text-xl sm:text-2xl text-zinc-900 font-normal mb-1.5">
                {isEn ? 'Upload your PDF Portfolio' : 'Tải lên bản PDF Portfolio của bạn'}
              </h3>
              <p className="text-xs sm:text-[13px] text-zinc-500 max-w-md mx-auto leading-relaxed font-sans mb-5">
                {isEn
                  ? 'Click here or drag and drop your exported PDF resume/portfolio to preview and provide instant download access.'
                  : 'Nhấp vào đây hoặc kéo thả file PDF hồ sơ / portfolio của bạn để xem trực tiếp trên trang và cung cấp link tải cho nhà tuyển dụng.'}
              </p>

              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold shadow-2xs group-hover:bg-black transition-colors"
              >
                {isEn ? 'Select PDF File' : 'Chọn tệp PDF từ máy tính'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* PROJECT DETAILS MODAL                                         */}
      {/* ============================================================ */}
      {selectedProjectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedProjectModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-zinc-200 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedProjectModal(null)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="mb-3">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-800">
                {selectedProjectModal.categoryBadge || 'CHI TIẾT DỰ ÁN'}
              </span>
            </div>

            <h2 className="font-serif text-2xl text-zinc-900 font-normal mb-3">
              {selectedProjectModal.name}
            </h2>

            <div className="aspect-[16/10] rounded-xl overflow-hidden bg-zinc-100 mb-5 border border-zinc-200/60">
              <img
                src={selectedProjectModal.image}
                alt={selectedProjectModal.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3.5 text-xs sm:text-[13px] text-zinc-600 leading-relaxed font-sans">
              <div>
                <strong className="text-zinc-900 block font-medium mb-1">Mô tả dự án:</strong>
                <p>
                  {typeof selectedProjectModal.description === 'object'
                    ? (isEn ? selectedProjectModal.description.en : selectedProjectModal.description.vi)
                    : selectedProjectModal.description}
                </p>
              </div>

              {selectedProjectModal.deliverables && (
                <div>
                  <strong className="text-zinc-900 block font-medium mb-1">Hạng mục thực hiện:</strong>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProjectModal.deliverables.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 text-xs font-mono"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span>Khách hàng: <strong className="text-zinc-800">{selectedProjectModal.client || 'góc Thương'}</strong></span>
                <span>Năm: <strong className="text-zinc-800">{selectedProjectModal.timeline || '2024'}</strong></span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedProjectModal(null);
                  onOpenContact(`Quan tâm dự án: ${selectedProjectModal.name}`);
                }}
                className="px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Trao đổi về dự án tương tự →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
