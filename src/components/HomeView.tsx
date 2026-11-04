import { useState, useMemo } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Award,
  CheckCircle2,
  Quote,
  Star,
  Layers,
  ChevronRight,
  X,
} from 'lucide-react';
import { Language, WORK_PROJECTS, WorkProject, Article, ARTICLES, UI_TEXT } from '../data/content';
import { ArticleCard } from './ArticleCard';
import { useCMS } from '../context/CMSContext';
import { DEFAULT_TYPOGRAPHY_SETTINGS, DEFAULT_HOME_SETTINGS } from '../services/cmsService';

interface HomeViewProps {
  lang: Language;
  onNavigate?: (tab: 'home' | 'connect' | 'work' | 'blog' | 'contact') => void;
  onSelectArticle?: (article: Article) => void;
  onOpenContact: (defaultService?: string) => void;
}

export function HomeView({
  lang,
  onNavigate,
  onSelectArticle,
  onOpenContact,
}: HomeViewProps) {
  const isEn = lang === 'en';
  const { siteSettings, publishedPosts, publishedProjects } = useCMS();
  const typography = siteSettings?.typography || DEFAULT_TYPOGRAPHY_SETTINGS;
  const homeSettings = siteSettings?.home || DEFAULT_HOME_SETTINGS;
  const t = UI_TEXT[lang].homeSection;

  const [selectedProjectModal, setSelectedProjectModal] = useState<WorkProject | null>(null);

  // Showcase projects: take top 6
  const showcaseProjects: WorkProject[] = useMemo(() => {
    const source = (publishedProjects && publishedProjects.length > 0)
      ? publishedProjects
      : WORK_PROJECTS;
    return source.slice(0, 6);
  }, [publishedProjects]);

  // Latest 3 articles from blog
  const latestArticles: Article[] = useMemo(() => {
    const source = (publishedPosts && publishedPosts.length > 0)
      ? publishedPosts
      : ARTICLES;
    return source.slice(0, 3);
  }, [publishedPosts]);

  return (
    <div className="animate-in fade-in duration-300">
      {/* ============================================================ */}
      {/* 1. HERO SECTION                                              */}
      {/* ============================================================ */}
      <section className="px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-12 sm:pb-16 max-w-[1360px] mx-auto border-b border-zinc-200/80">
        <div className="max-w-4xl">
          <div className="flex items-center gap-2 text-[11px] font-mono font-semibold tracking-wider uppercase text-zinc-400 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isEn ? (homeSettings.whatWeDoKicker_en || 'TOKYO / GLOBAL') : (homeSettings.whatWeDoKicker_vi || 'TOKYO / TOÀN CẦU')}</span>
            <span className="text-zinc-300">•</span>
            <span className="text-zinc-500">{t.statusBadge}</span>
          </div>

          <h1
            style={{
              fontFamily: typography.h1FontFamily,
              fontSize: typography.h1CustomPx
                ? `clamp(36px, 7vw, ${typography.h1CustomPx}px)`
                : undefined,
            }}
            className="font-serif text-[40px] xs:text-[54px] sm:text-[68px] md:text-[84px] leading-[1.08] font-normal text-zinc-900 tracking-tight mb-6"
          >
            {isEn ? homeSettings.heroTitle_en : homeSettings.heroTitle_vi}
          </h1>

          <p className="text-zinc-600 text-base sm:text-lg md:text-xl max-w-2xl font-sans leading-relaxed mb-8">
            {isEn ? homeSettings.heroSubtitle_en : homeSettings.heroSubtitle_vi}
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => onNavigate?.('work')}
              className="px-6 py-3.5 bg-zinc-900 hover:bg-black text-white text-xs font-mono font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-xs flex items-center gap-2"
            >
              <span>{t.ctaExplore}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onOpenContact()}
              className="px-6 py-3.5 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 text-xs font-mono font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer border border-zinc-200/80"
            >
              {t.ctaContact}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 sm:pt-16 mt-8 border-t border-zinc-100">
          {t.stats.map((stat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="font-serif text-3xl sm:text-4xl text-zinc-900 font-normal tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. FEATURED WORKS (6 PROJECTS GRID)                          */}
      {/* ============================================================ */}
      <section className="px-4 sm:px-6 lg:px-8 py-14 sm:py-20 max-w-[1360px] mx-auto border-b border-zinc-200/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
              {t.worksBadge}
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-zinc-900 font-normal">
              {t.worksTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onNavigate?.('work')}
            className="self-start sm:self-auto text-xs font-mono uppercase font-semibold text-zinc-900 hover:text-zinc-600 flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <span>{t.viewAllWork}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {showcaseProjects.map((project) => {
            const projectTitle =
              typeof project.title === 'object'
                ? isEn
                  ? project.title.en
                  : project.title.vi
                : project.title || project.name;

            const projectCategory =
              typeof project.category === 'object'
                ? isEn
                  ? project.category.en
                  : project.category.vi
                : project.category;

            const projectDesc =
              typeof project.description === 'object'
                ? isEn
                  ? project.description.en
                  : project.description.vi
                : project.description;

            return (
              <div
                key={project.id}
                onClick={() => setSelectedProjectModal(project)}
                className="group flex flex-col bg-white border border-zinc-200/80 rounded-xl overflow-hidden hover:border-zinc-400 hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-xs font-mono text-white flex items-center gap-1 font-semibold">
                      {isEn ? 'View details' : 'Xem chi tiết'}
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {project.categoryBadge && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-black/80 backdrop-blur-xs text-white">
                        {project.categoryBadge}
                      </span>
                    </div>
                  )}

                  {project.year && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/90 backdrop-blur-xs text-zinc-800 border border-zinc-200">
                        {project.year}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                      {projectCategory}
                    </div>

                    <h3 className="font-serif text-xl sm:text-2xl text-zinc-900 font-normal group-hover:text-zinc-600 transition-colors mb-2.5">
                      {projectTitle}
                    </h3>

                    <p className="text-zinc-600 text-xs sm:text-[13px] leading-relaxed line-clamp-2 mb-4 font-sans">
                      {projectDesc}
                    </p>
                  </div>

                  {project.deliverables && project.deliverables.length > 0 && (
                    <div className="pt-3 border-t border-zinc-100 flex flex-wrap gap-1.5">
                      {project.deliverables.slice(0, 3).map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-zinc-100 text-[10px] font-mono text-zinc-600"
                        >
                          {item}
                        </span>
                      ))}
                      {project.deliverables.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                          +{project.deliverables.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. PHILOSOPHY & CRAFT                                        */}
      {/* ============================================================ */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-[1360px] mx-auto border-b border-zinc-200/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
              {t.philosophyBadge}
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-zinc-900 font-normal leading-snug mb-6">
              {t.philosophyTitle}
            </h2>
            <blockquote className="border-l-2 border-zinc-900 pl-4 py-1 text-sm text-zinc-600 italic leading-relaxed mb-4">
              "{t.philosophyQuote}"
            </blockquote>
            <cite className="text-xs font-mono text-zinc-400 block not-italic">
              {t.philosophyAuthor}
            </cite>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {t.pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <span className="font-serif text-2xl text-zinc-400 font-light">
                    {pillar.num}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl text-zinc-900 font-normal mb-1.5">
                      {pillar.title}
                    </h3>
                    <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed font-sans">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. CLIENT TESTIMONIALS                                       */}
      {/* ============================================================ */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-[1360px] mx-auto border-b border-zinc-200/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
            {isEn ? homeSettings.clientsKicker_en : homeSettings.clientsKicker_vi}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-zinc-900 font-normal">
            {isEn ? homeSettings.clientsTitle_en : homeSettings.clientsTitle_vi}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(homeSettings.clientReviews || []).map((review, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl border border-zinc-200/80 bg-white flex flex-col justify-between hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <h4 className="font-serif text-base text-zinc-900 font-normal mb-2 leading-snug">
                  "{isEn ? review.quote_en : review.quote_vi}"
                </h4>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans mb-6">
                  {isEn ? review.body_en : review.body_vi}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center gap-3">
                <img
                  src={review.avatar}
                  alt={review.author}
                  className="w-9 h-9 rounded-full object-cover border border-zinc-200"
                />
                <div>
                  <div className="text-xs font-semibold text-zinc-900 font-sans">
                    {review.author}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400">
                    {review.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. LATEST ARTICLES FROM BLOG                                 */}
      {/* ============================================================ */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 max-w-[1360px] mx-auto border-b border-zinc-200/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
              {t.articlesBadge}
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-zinc-900 font-normal">
              {t.articlesTitle}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              {t.articlesDesc}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate?.('blog')}
            className="self-start sm:self-auto text-xs font-mono uppercase font-semibold text-zinc-900 hover:text-zinc-600 flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <span>{t.viewAllArticles}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {latestArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              lang={lang}
              onRead={(art: Article) => {
                onSelectArticle?.(art);
                onNavigate?.('blog');
              }}
            />
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. COLLABORATION CTA BANNER                                  */}
      {/* ============================================================ */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-[1360px] mx-auto">
        <div className="rounded-2xl bg-zinc-900 text-white p-8 sm:p-14 lg:p-16 relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <span className="px-2.5 py-1 rounded text-[11px] font-mono tracking-wider uppercase bg-white/10 text-zinc-300 inline-block mb-4">
              {t.ctaBanner.tag}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight mb-4">
              {t.ctaBanner.title}
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-8">
              {t.ctaBanner.subtitle}
            </p>
            <button
              type="button"
              onClick={() => onOpenContact()}
              className="px-6 py-3.5 bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-mono font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
            >
              <span>{t.ctaBanner.button}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Modal for Project detail if clicked on Home */}
      {selectedProjectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedProjectModal(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative border border-zinc-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedProjectModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-zinc-400 uppercase">
              {selectedProjectModal.categoryBadge && (
                <span className="px-2 py-0.5 rounded bg-zinc-900 text-white font-semibold">
                  {selectedProjectModal.categoryBadge}
                </span>
              )}
              {selectedProjectModal.year && <span>• {selectedProjectModal.year}</span>}
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl text-zinc-900 font-normal mb-2">
              {typeof selectedProjectModal.title === 'object'
                ? isEn
                  ? selectedProjectModal.title.en
                  : selectedProjectModal.title.vi
                : selectedProjectModal.title || selectedProjectModal.name}
            </h2>

            <p className="text-zinc-500 text-xs sm:text-sm mb-5 font-mono">
              {typeof selectedProjectModal.category === 'object'
                ? isEn
                  ? selectedProjectModal.category.en
                  : selectedProjectModal.category.vi
                : selectedProjectModal.category}
            </p>

            <div className="aspect-[16/10] rounded-xl overflow-hidden bg-zinc-100 mb-6 border border-zinc-200/80">
              <img
                src={selectedProjectModal.image}
                alt={selectedProjectModal.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                {isEn ? 'Overview' : 'Tổng quan dự án'}
              </h4>
              <p className="text-sm text-zinc-700 leading-relaxed font-sans">
                {typeof selectedProjectModal.description === 'object'
                  ? isEn
                    ? selectedProjectModal.description.en
                    : selectedProjectModal.description.vi
                  : selectedProjectModal.description}
              </p>
            </div>

            {selectedProjectModal.deliverables && (
              <div className="mb-8">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2.5">
                  {isEn ? 'Deliverables' : 'Hạng mục thực hiện'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProjectModal.deliverables.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded bg-zinc-100 text-zinc-800 text-xs font-mono"
                    >
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedProjectModal(null)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-mono text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                {isEn ? 'Close' : 'Đóng'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const projName = selectedProjectModal.name;
                  setSelectedProjectModal(null);
                  onOpenContact(`Dự án: ${projName}`);
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-mono font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-xs"
              >
                {isEn ? 'INQUIRE ABOUT THIS PROJECT' : 'LIÊN HỆ VỀ DỰ ÁN NÀY'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
