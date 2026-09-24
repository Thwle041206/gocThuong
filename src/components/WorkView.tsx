import { useState, useMemo } from 'react';
import { ArrowUpRight, X, Sparkles } from 'lucide-react';
import { Language, WORK_PROJECTS, WorkProject, UI_TEXT } from '../data/content';
import { useCMS } from '../context/CMSContext';
import { getBadgeColorClasses, DEFAULT_TYPOGRAPHY_SETTINGS } from '../services/cmsService';

interface WorkViewProps {
  lang: Language;
  onOpenContact: (defaultService?: string) => void;
}

export function WorkView({ lang, onOpenContact }: WorkViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [activeProjectModal, setActiveProjectModal] = useState<WorkProject | null>(null);
  const { publishedProjects, siteSettings, categories, editorialTags } = useCMS();

  const t = UI_TEXT[lang].workSection;
  const isEn = lang === 'en';

  const allProjects = publishedProjects && publishedProjects.length > 0 ? publishedProjects : WORK_PROJECTS;

  // Dynamically compute available category filter tabs for Work projects from CMS & real project data
  const dynamicWorkFilters = useMemo(() => {
    const filtersMap = new Map<string, string>();

    // 1. Add categories explicitly configured in CMS for work
    (categories || []).forEach((c) => {
      if (c.target === 'work' || c.target === 'both') {
        const key = c.name.toUpperCase();
        const label = isEn ? (c.label_en || c.name) : (c.label_vi || c.name);
        filtersMap.set(key, label);
      }
    });

    // 2. Extract unique category badges & tags directly from published projects
    allProjects.forEach((proj) => {
      if (proj.categoryBadge) {
        const key = proj.categoryBadge.toUpperCase();
        if (!filtersMap.has(key)) {
          filtersMap.set(key, proj.categoryBadge);
        }
      }
      if (proj.filterTag) {
        const key = proj.filterTag.toUpperCase();
        if (!filtersMap.has(key)) {
          filtersMap.set(key, proj.filterTag);
        }
      }
      if (proj.secondaryTag) {
        const key = proj.secondaryTag.toUpperCase();
        if (!filtersMap.has(key)) {
          filtersMap.set(key, proj.secondaryTag);
        }
      }
    });

    // Minimal fallback if no categories exist at all
    if (filtersMap.size === 0) {
      filtersMap.set('BRANDING', isEn ? 'Branding' : 'Xây dựng thương hiệu');
      filtersMap.set('WEB DESIGN', isEn ? 'Web Design' : 'Thiết kế Web');
      filtersMap.set('WEB DEVELOPMENT', isEn ? 'Web Development' : 'Phát triển Web');
    }

    return Array.from(filtersMap.entries()).map(([key, label]) => ({ key, label }));
  }, [categories, allProjects, isEn]);

  const filteredProjects = selectedFilter === 'ALL'
    ? allProjects
    : allProjects.filter(
        (p) =>
          (p.filterTag || '').toUpperCase() === selectedFilter.toUpperCase() ||
          (p.secondaryTag || '').toUpperCase() === selectedFilter.toUpperCase() ||
          (p.categoryBadge || '').toUpperCase() === selectedFilter.toUpperCase()
      );

  const handleFilterClick = (filterKey: string) => {
    if (selectedFilter.toUpperCase() === filterKey.toUpperCase()) {
      setSelectedFilter('ALL');
    } else {
      setSelectedFilter(filterKey);
    }
  };

  const dynamicTitle = isEn
    ? siteSettings?.work?.title_en || t.title
    : siteSettings?.work?.title_vi || t.title;

  const dynamicSubtitle = isEn
    ? siteSettings?.work?.subtitle_en || t.subtitle
    : siteSettings?.work?.subtitle_vi || t.subtitle;

  const typography = siteSettings?.typography || DEFAULT_TYPOGRAPHY_SETTINGS;

  return (
    <div className="animate-in fade-in duration-300 pb-20 sm:pb-28">
      {/* 1. WORK HEADING & SUBTITLE */}
      <section className="px-6 sm:px-10 lg:px-12 pt-10 sm:pt-16 pb-8 text-center max-w-4xl mx-auto">
        <h1
          style={{
            fontFamily: typography.h1FontFamily,
            fontSize: typography.h1CustomPx ? `clamp(34px, 7vw, ${typography.h1CustomPx}px)` : undefined,
          }}
          className="font-serif text-[38px] leading-[1.1] xs:text-5xl sm:text-6xl md:text-7xl lg:text-[76px] text-zinc-900 font-normal sm:leading-[1.05] tracking-tight"
        >
          {dynamicTitle}
        </h1>
        <p className="mt-4 sm:mt-5 text-zinc-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed font-sans text-balance">
          {dynamicSubtitle}
        </p>

        {/* Pill filter bar dynamic from CMS */}
        <div className="mt-8 sm:mt-10 inline-flex flex-wrap items-center justify-center gap-1.5 max-w-full">
          <div className="bg-black text-white rounded-full px-3 py-1.5 sm:px-4 sm:py-2 flex flex-wrap items-center justify-center gap-1 sm:gap-2 shadow-md">
            {/* Optional subtle ALL reset if filtered */}
            {selectedFilter !== 'ALL' && (
              <button
                onClick={() => setSelectedFilter('ALL')}
                className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕ {t.filters.all}
              </button>
            )}

            {dynamicWorkFilters.map((flt) => {
              const isActive = selectedFilter.toUpperCase() === flt.key.toUpperCase();
              return (
                <button
                  key={flt.key}
                  onClick={() => handleFilterClick(flt.key)}
                  className={`text-[10px] sm:text-[11px] font-semibold tracking-[0.14em] uppercase px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    isActive
                      ? 'bg-zinc-800 text-white shadow-xs underline underline-offset-4'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  {flt.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. 2-COLUMN PROJECT GRID MATCHING SCREENSHOT */}
      <section className="px-6 sm:px-10 lg:px-12 max-w-[1360px] mx-auto pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
          {filteredProjects.map((project) => {
            const matchingBadge = editorialTags?.find(
              (tag) => tag.name.toUpperCase() === (project.categoryBadge || '').toUpperCase()
            );
            const badgeColorClass = getBadgeColorClasses(matchingBadge?.color || 'zinc');

            return (
              <div
                key={project.id}
                onClick={() => setActiveProjectModal(project)}
                className="group cursor-pointer flex flex-col"
              >
                {/* Outer soft grey card container */}
                <div className="bg-[#f8f8f8] hover:bg-[#f3f3f3] transition-colors duration-300 rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 border border-zinc-200/70 flex items-center justify-center">
                  {/* Floating Mockup Browser / Canvas */}
                  <div className="w-full relative aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-[0_20px_45px_-12px_rgba(0,0,0,0.22)] group-hover:shadow-[0_28px_55px_-12px_rgba(0,0,0,0.32)] transition-all duration-500 ease-out group-hover:scale-[1.018]">
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    {/* Subtle hover prompt */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="bg-white/95 text-zinc-900 text-[11px] font-semibold tracking-wider uppercase px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-xs">
                        <span>{lang === 'en' ? 'VIEW CASE STUDY' : 'XEM DỰ ÁN'}</span>
                        <ArrowUpRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Label Row: Left = Name, Right = Category Badge */}
                <div className="flex items-baseline justify-between pt-4 sm:pt-5 px-1">
                  <h3 className="font-serif text-xl sm:text-2xl text-zinc-900 group-hover:text-zinc-600 transition-colors font-normal">
                    {project.name}
                  </h3>
                  <span className={`text-[10px] font-semibold tracking-[0.16em] uppercase px-2 py-0.5 rounded ${badgeColorClass}`}>
                    {project.categoryBadge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-20 text-zinc-400">
            <p className="font-serif text-2xl">
              {lang === 'en' ? 'No projects found with this filter' : 'Chưa có dự án phù hợp với bộ lọc này'}
            </p>
            <button
              onClick={() => setSelectedFilter('ALL')}
              className="mt-4 text-xs uppercase font-semibold underline text-black cursor-pointer"
            >
              {lang === 'en' ? 'View all projects' : 'Xem tất cả dự án'}
            </button>
          </div>
        )}
      </section>

      {/* 3. CASE STUDY DETAIL MODAL */}
      {activeProjectModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setActiveProjectModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl relative my-8 border border-zinc-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveProjectModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black transition-colors cursor-pointer"
              aria-label="Close project modal"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase bg-black text-white px-2.5 py-1 rounded">
                {activeProjectModal.categoryBadge}
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                {activeProjectModal.year}
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl text-zinc-900 mb-2">
              {activeProjectModal.title[lang]}
            </h2>
            <p className="text-xs uppercase tracking-wider text-zinc-400 mb-6">
              {activeProjectModal.category[lang]}
            </p>

            {/* Featured Image */}
            <div className="rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 mb-6 aspect-[16/10] shadow-sm">
              <img
                src={activeProjectModal.image}
                alt={activeProjectModal.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Description & Details */}
            <div className="space-y-6">
              <p className="text-zinc-700 text-sm sm:text-base leading-relaxed">
                {activeProjectModal.description[lang]}
              </p>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-100">
                <div>
                  <span className="text-[10px] tracking-wider uppercase text-zinc-400 font-semibold block mb-1">
                    {t.clientLabel}
                  </span>
                  <span className="text-xs sm:text-sm text-zinc-800 font-medium">
                    {activeProjectModal.client || 'Confidential'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] tracking-wider uppercase text-zinc-400 font-semibold block mb-1">
                    {t.timelineLabel}
                  </span>
                  <span className="text-xs sm:text-sm text-zinc-800 font-medium">
                    {activeProjectModal.timeline || '8 Weeks'}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] tracking-wider uppercase text-zinc-400 font-semibold block mb-1">
                    {t.deliverablesLabel}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProjectModal.deliverables.map((d) => (
                      <span
                        key={d}
                        className="text-[10px] text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA Action */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-100">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Sparkles size={15} className="text-zinc-800" />
                  <span>
                    {lang === 'en'
                      ? 'Interested in creating something similar?'
                      : 'Bạn muốn thực hiện một dự án với chất lượng tương tự?'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    const projectName = activeProjectModal.title[lang];
                    setActiveProjectModal(null);
                    onOpenContact(projectName);
                  }}
                  className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-full text-xs font-semibold tracking-widest uppercase hover:bg-zinc-800 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>{t.inquireBtn}</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
