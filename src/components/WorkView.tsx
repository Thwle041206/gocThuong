import { useState, useMemo } from 'react';
import { ArrowUpRight, X, Sparkles, Tag, Search, RotateCcw } from 'lucide-react';
import { Language, WORK_PROJECTS, WorkProject, UI_TEXT } from '../data/content';
import { useCMS } from '../context/CMSContext';
import { getBadgeColorClasses, DEFAULT_TYPOGRAPHY_SETTINGS } from '../services/cmsService';

interface WorkViewProps {
  lang: Language;
  onOpenContact: (defaultService?: string) => void;
}

export function WorkView({ lang, onOpenContact }: WorkViewProps) {
  const [activeBadges, setActiveBadges] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProjectModal, setActiveProjectModal] = useState<WorkProject | null>(null);
  const { publishedProjects, siteSettings, editorialTags } = useCMS();

  const t = UI_TEXT[lang].workSection;
  const isEn = lang === 'en';

  // Live database connection: publishedProjects from Firestore with fallback to WORK_PROJECTS
  const allProjects = publishedProjects && publishedProjects.length > 0 ? publishedProjects : WORK_PROJECTS;

  // Dynamic tags for projects (from CMS editorialTags and project data)
  const displayTags = useMemo(() => {
    const tagsMap = new Map<string, { id: string; name: string; color: string }>();

    // 1. From CMS editorialTags marked for projects or both
    (editorialTags || []).forEach((t) => {
      if (!t.badgeType || t.badgeType === 'project' || t.badgeType === 'both') {
        tagsMap.set(t.name.toUpperCase(), {
          id: t.id,
          name: t.name.toUpperCase(),
          color: t.color || 'dark',
        });
      }
    });

    // 2. From allProjects categoryBadge / filterTag if not already present
    allProjects.forEach((p) => {
      const b = p.categoryBadge?.toUpperCase() || p.filterTag?.toUpperCase();
      if (b && !tagsMap.has(b)) {
        tagsMap.set(b, {
          id: `tag-${b.toLowerCase()}`,
          name: b,
          color: 'dark',
        });
      }
    });

    // Fallbacks if empty
    if (tagsMap.size === 0) {
      tagsMap.set('BRANDING', { id: 'tag-branding', name: 'BRANDING', color: 'dark' });
      tagsMap.set('WEB DESIGN', { id: 'tag-webdesign', name: 'WEB DESIGN', color: 'indigo' });
      tagsMap.set('WEB DEVELOPMENT', { id: 'tag-webdev', name: 'WEB DEVELOPMENT', color: 'emerald' });
    }

    return Array.from(tagsMap.values());
  }, [editorialTags, allProjects]);

  const isBadgeActive = (badgeName: string) => {
    if (badgeName === 'ALL') {
      return !activeBadges || activeBadges.length === 0;
    }
    return activeBadges.some((b) => b.toUpperCase() === badgeName.toUpperCase());
  };

  const handleToggleBadge = (badge: string) => {
    if (badge === 'ALL') {
      setActiveBadges([]);
      return;
    }
    const upper = badge.toUpperCase();
    setActiveBadges((prev) => {
      const isSelected = prev.some((b) => b.toUpperCase() === upper);
      if (isSelected) {
        return prev.filter((b) => b.toUpperCase() !== upper);
      } else {
        return [...prev, badge];
      }
    });
  };

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allProjects.filter((p) => {
      // Badge matching
      const matchBadge =
        activeBadges.length === 0 ||
        activeBadges.some((b) => {
          if (b.toUpperCase() === 'ALL') return true;
          const bUpper = b.toUpperCase();
          return (
            (p.categoryBadge || '').toUpperCase() === bUpper ||
            (p.filterTag || '').toUpperCase() === bUpper ||
            (p.secondaryTag || '').toUpperCase() === bUpper ||
            (p.category?.en || '').toUpperCase() === bUpper ||
            (p.category?.vi || '').toUpperCase() === bUpper
          );
        });

      if (!matchBadge) return false;

      if (!q) return true;

      const name = (p.name || '').toLowerCase();
      const titleEn = (p.title?.en || '').toLowerCase();
      const titleVi = (p.title?.vi || '').toLowerCase();
      const descEn = (p.description?.en || '').toLowerCase();
      const descVi = (p.description?.vi || '').toLowerCase();
      const client = (p.client || '').toLowerCase();
      const categoryBadge = (p.categoryBadge || '').toLowerCase();
      const filterTag = (p.filterTag || '').toLowerCase();
      const deliverables = (p.deliverables || []).join(' ').toLowerCase();

      return (
        name.includes(q) ||
        titleEn.includes(q) ||
        titleVi.includes(q) ||
        descEn.includes(q) ||
        descVi.includes(q) ||
        client.includes(q) ||
        categoryBadge.includes(q) ||
        filterTag.includes(q) ||
        deliverables.includes(q)
      );
    });
  }, [allProjects, activeBadges, searchQuery]);

  const hasActiveFilters = activeBadges.length > 0 || Boolean(searchQuery.trim());

  const dynamicTitle = isEn
    ? siteSettings?.work?.title_en || t.title
    : siteSettings?.work?.title_vi || t.title;

  const dynamicSubtitle = isEn
    ? siteSettings?.work?.subtitle_en || t.subtitle
    : (siteSettings?.work?.subtitle_vi && !siteSettings?.work?.subtitle_vi.includes('Khám phá')
        ? siteSettings?.work?.subtitle_vi
        : 'Các dự án mình tham gia đóng góp và ý tưởng tìm đối tác đồng hành');

  const typography = siteSettings?.typography || DEFAULT_TYPOGRAPHY_SETTINGS;

  return (
    <div className="animate-in fade-in duration-300 pb-0">
      {/* 1. WORK HEADING & SUBTITLE WITH BADGE PILLS */}
      <section className="px-6 sm:px-10 lg:px-12 pt-10 sm:pt-16 pb-6 text-center max-w-4xl mx-auto">
        <h1
          style={{
            fontFamily: typography.h1FontFamily,
            fontSize: typography.h1CustomPx ? `clamp(29px, 6.4vw, ${Math.round(typography.h1CustomPx * 0.8)}px)` : undefined,
          }}
          className="font-serif text-[32px] leading-[1.15] xs:text-[48px] sm:text-[58px] md:text-[77px] text-zinc-900 font-normal tracking-tight"
        >
          {dynamicTitle}
        </h1>
        <p className="mt-4 sm:mt-5 text-zinc-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed font-sans text-balance">
          {dynamicSubtitle}
        </p>

        {/* BADGE (Thẻ Nhãn) Multi-Select Filter Pills matching blog */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-6 sm:pt-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mr-1">
            <Tag size={13} className="text-zinc-500" />
            <span>{isEn ? 'BADGE:' : 'THẺ NHÃN:'}</span>
          </div>

          <button
            onClick={() => handleToggleBadge('ALL')}
            className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase transition-all cursor-pointer border ${
              isBadgeActive('ALL')
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                : 'bg-zinc-100/90 text-zinc-600 border-zinc-200/80 hover:bg-zinc-200/80 hover:text-zinc-900'
            }`}
            title={isEn ? 'Select all badges' : 'Chọn tất cả thẻ nhãn'}
          >
            {isEn ? 'ALL BADGES' : 'TẤT CẢ THẺ'}
          </button>

          {displayTags.map((tag) => {
            const active = isBadgeActive(tag.name);
            const badgeClasses = getBadgeColorClasses(tag.color || 'dark');

            return (
              <button
                key={tag.id}
                onClick={() => handleToggleBadge(tag.name)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase transition-all cursor-pointer border ${
                  active
                    ? 'ring-2 ring-zinc-900 ring-offset-1 font-bold shadow-2xs ' + badgeClasses
                    : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300'
                }`}
                title={isEn ? `Toggle badge ${tag.name}` : `Chọn/Bỏ chọn thẻ nhãn ${tag.name}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    tag.color === 'emerald'
                      ? 'bg-emerald-500'
                      : tag.color === 'indigo'
                      ? 'bg-indigo-500'
                      : tag.color === 'rose'
                      ? 'bg-rose-500'
                      : tag.color === 'amber'
                      ? 'bg-amber-500'
                      : tag.color === 'purple'
                      ? 'bg-purple-500'
                      : tag.color === 'cyan'
                      ? 'bg-cyan-500'
                      : 'bg-zinc-800'
                  }`}
                />
                <span>{tag.name}</span>
                {active && <span className="ml-0.5 text-[9px] text-zinc-600">✓</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Integrated Toolbar ("narbav") with Projects Count (Left), Active Filter Pills, and Search Box (Right) */}
      <div className="px-4 sm:px-6 max-w-7xl mx-auto mb-8 sm:mb-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 pt-6 border-t border-zinc-200/70">
          {/* Left: Projects Count & Active Filter Indicator */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 flex-wrap justify-center md:justify-start shrink-0">
            <span className="font-serif italic font-medium text-zinc-800 text-sm">
              {filteredProjects.length} {isEn ? 'projects' : 'dự án'}
            </span>

            {hasActiveFilters && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-300 flex-wrap">
                <span className="text-[11px] text-zinc-400">
                  {isEn ? 'Filtering by:' : 'Đang lọc:'}
                </span>

                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1 bg-zinc-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    <span>"{searchQuery.trim()}"</span>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="hover:text-rose-300 cursor-pointer ml-0.5"
                      title={isEn ? 'Remove keyword' : 'Xóa từ khóa'}
                    >
                      ✕
                    </button>
                  </span>
                )}

                {activeBadges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1 bg-zinc-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase"
                  >
                    <span>#{badge}</span>
                    <button
                      onClick={() => handleToggleBadge(badge)}
                      className="hover:text-rose-300 cursor-pointer ml-0.5"
                      title={isEn ? `Remove tag ${badge}` : `Bỏ lọc nhãn ${badge}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}

                <button
                  onClick={() => {
                    setActiveBadges([]);
                    setSearchQuery('');
                  }}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 ml-1 flex items-center gap-1 cursor-pointer"
                  title={isEn ? 'Reset all filters' : 'Xóa toàn bộ bộ lọc'}
                >
                  <RotateCcw size={11} />
                  <span>{isEn ? 'Reset' : 'Đặt lại'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Center/Right: Search Box Input */}
          <div className="w-full md:max-w-md my-1 md:my-0 flex-1 md:flex-initial">
            <div className="relative flex items-center bg-zinc-50 hover:bg-white focus-within:bg-white border border-zinc-200/90 focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/10 rounded-full px-3.5 py-1.5 shadow-2xs transition-all">
              <Search size={15} className="text-zinc-500 shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isEn
                    ? 'Search by project name, client, category...'
                    : 'Tìm theo tên dự án, khách hàng, thể loại...'
                }
                className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-zinc-400 hover:text-zinc-800 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer ml-1 shrink-0"
                  title={isEn ? 'Clear search' : 'Xóa tìm kiếm'}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4-COLUMN RESPONSIVE PROJECT GRID (MATCHING BLOG GRID SECTION FORMAT) */}
      <section className="px-4 sm:px-6 mx-auto pb-16 transition-all duration-300 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-6 gap-y-8 sm:gap-y-10 animate-in fade-in duration-300">
          {filteredProjects.map((project, idx) => {
            const matchingBadge = editorialTags?.find(
              (tag) => tag.name.toUpperCase() === (project.categoryBadge || project.filterTag || '').toUpperCase()
            );
            const badgeColorClass = getBadgeColorClasses(matchingBadge?.color || 'dark');

            return (
              <article
                key={project.id}
                onClick={() => setActiveProjectModal(project)}
                className="group cursor-pointer flex flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900 rounded-2xl"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveProjectModal(project);
                  }
                }}
              >
                {/* Image Container with 16:10 Aspect Ratio, Top-Right Badge, Hover Prompt */}
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200/50 shadow-xs">
                  <img
                    src={project.image}
                    alt={project.title?.[lang] || project.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />

                  {/* Top-Right Badge with dynamic CMS style */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded select-none ${badgeColorClass}`}>
                      {project.categoryBadge || project.filterTag}
                    </span>
                  </div>

                  {/* Bottom "VIEW PROJECT" bar on hover or top card */}
                  <div
                    className={`absolute inset-x-3 bottom-3 z-10 transition-all duration-300 ${
                      idx === 0
                        ? 'opacity-95 translate-y-0'
                        : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                    }`}
                  >
                    <div className="w-full bg-black/90 backdrop-blur-xs text-white text-center py-2.5 px-4 rounded-lg text-[11px] font-medium tracking-[0.16em] uppercase flex items-center justify-center gap-1.5 shadow-lg group-hover:bg-black transition-colors">
                      <span>{isEn ? 'VIEW PROJECT' : 'XEM DỰ ÁN'}</span>
                      <ArrowUpRight size={13} className="text-zinc-300" />
                    </div>
                  </div>
                </div>

                {/* Project Content Below Image */}
                <div className="pt-3.5 sm:pt-4 pb-2 flex flex-col flex-1">
                  {/* Title in Serif font */}
                  <h2 className="font-serif text-lg sm:text-xl font-normal leading-[1.3] text-zinc-900 group-hover:text-zinc-600 transition-colors text-balance line-clamp-2">
                    {project.title?.[lang] || project.name}
                  </h2>

                  {/* Subtitle / Excerpt in muted sans font */}
                  <p className="mt-1.5 text-xs sm:text-[13px] text-zinc-500 font-sans leading-relaxed line-clamp-2">
                    {project.description?.[lang] || project.name}
                  </p>

                  {/* Clean Typographic Metadata Footer */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400 font-sans flex-wrap">
                    <span className="text-zinc-600 font-medium">{project.client || 'Client'}</span>
                    <span aria-hidden="true" className="text-zinc-300">·</span>
                    <span>{project.year || '2024'}</span>
                    <span aria-hidden="true" className="text-zinc-300">·</span>
                    <span>{project.category?.[lang] || project.categoryBadge}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Empty State matching blog */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-20 text-zinc-400 bg-zinc-50/60 rounded-3xl border border-dashed border-zinc-200 max-w-2xl mx-auto mt-6 px-6">
            <p className="font-serif text-2xl text-zinc-700">
              {isEn
                ? 'No projects match your search or filters'
                : 'Không tìm thấy dự án nào phù hợp với tìm kiếm hoặc bộ lọc'}
            </p>
            <p className="text-xs text-zinc-500 mt-2 max-w-md mx-auto">
              {isEn
                ? 'Try adjusting your search keyword or clearing the filters to explore all projects.'
                : 'Hãy thử đổi từ khóa tìm kiếm hoặc xóa các bộ lọc để khám phá toàn bộ dự án.'}
            </p>
            <button
              onClick={() => {
                setActiveBadges([]);
                setSearchQuery('');
              }}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs uppercase font-semibold bg-black text-white hover:bg-zinc-800 transition-all cursor-pointer shadow-xs"
            >
              <RotateCcw size={13} />
              <span>{isEn ? 'Reset all filters & search' : 'Xóa tìm kiếm & bộ lọc'}</span>
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
