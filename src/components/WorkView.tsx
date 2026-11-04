import { useState, useMemo } from 'react';
import {
  ExternalLink,
  Search,
  X,
  ArrowUpRight,
  Filter,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Language, WORK_PROJECTS, WorkProject, UI_TEXT } from '../data/content';
import { useCMS } from '../context/CMSContext';
import { DEFAULT_TYPOGRAPHY_SETTINGS, getBadgeColorClasses } from '../services/cmsService';

interface WorkViewProps {
  lang: Language;
  onOpenContact: (defaultService?: string) => void;
}

export function WorkView({ lang, onOpenContact }: WorkViewProps) {
  const isEn = lang === 'en';
  const { siteSettings, publishedProjects, editorialTags, categories } = useCMS();
  const typography = siteSettings?.typography || DEFAULT_TYPOGRAPHY_SETTINGS;
  const t = UI_TEXT[lang].workSection;

  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<WorkProject | null>(null);

  // Combine CMS projects with default WORK_PROJECTS
  const allProjects: WorkProject[] = useMemo(() => {
    if (publishedProjects && publishedProjects.length > 0) {
      return publishedProjects;
    }
    return WORK_PROJECTS;
  }, [publishedProjects]);

  // Project tags for filtering
  const filterOptions = useMemo(() => {
    const set = new Set<string>();
    allProjects.forEach((p) => {
      if (p.categoryBadge) set.add(p.categoryBadge.toUpperCase());
      if (p.filterTag) set.add(p.filterTag.toUpperCase());
      if (p.secondaryTag) set.add(p.secondaryTag.toUpperCase());
    });

    // Also include project-oriented tags from CMS if configured
    if (editorialTags) {
      editorialTags
        .filter((tag) => tag.badgeType === 'project' || tag.badgeType === 'both')
        .forEach((tag) => set.add(tag.name.toUpperCase()));
    }

    return ['ALL', ...Array.from(set)];
  }, [allProjects, editorialTags]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      // Filter by tag
      if (activeFilter !== 'ALL') {
        const matchesBadge = project.categoryBadge?.toUpperCase() === activeFilter;
        const matchesTag = project.filterTag?.toUpperCase() === activeFilter;
        const matchesSecTag = project.secondaryTag?.toUpperCase() === activeFilter;
        if (!matchesBadge && !matchesTag && !matchesSecTag) return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (project.name || '').toLowerCase();
        const client = (project.client || '').toLowerCase();
        const title = (
          typeof project.title === 'object'
            ? `${project.title.vi} ${project.title.en}`
            : project.title || ''
        ).toLowerCase();
        const desc = (
          typeof project.description === 'object'
            ? `${project.description.vi} ${project.description.en}`
            : project.description || ''
        ).toLowerCase();
        const deliverables = (project.deliverables || []).join(' ').toLowerCase();

        return (
          name.includes(q) ||
          client.includes(q) ||
          title.includes(q) ||
          desc.includes(q) ||
          deliverables.includes(q)
        );
      }

      return true;
    });
  }, [allProjects, activeFilter, searchQuery]);

  return (
    <div className="animate-in fade-in duration-300 pb-20">
      {/* Header section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-8 max-w-[1360px] mx-auto border-b border-zinc-200/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono font-semibold tracking-wider uppercase text-zinc-400 mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
              <span>{isEn ? 'SELECTED WORKS (2023 - 2024)' : 'DỰ ÁN ĐÃ THỰC HIỆN (2023 - 2024)'}</span>
            </div>

            <h1
              style={{
                fontFamily: typography.h1FontFamily,
                fontSize: typography.h1CustomPx
                  ? `clamp(32px, 6vw, ${typography.h1CustomPx}px)`
                  : undefined,
              }}
              className="font-serif text-[36px] sm:text-[54px] md:text-[68px] leading-[1.1] font-normal text-zinc-900 tracking-tight mb-3"
            >
              {t.title}
            </h1>

            <p className="text-zinc-600 text-sm sm:text-base max-w-2xl font-sans leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          {/* Search box */}
          <div className="w-full md:w-80">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEn ? 'Search projects, clients...' : 'Tìm kiếm dự án, khách hàng...'}
                className="w-full pl-9 pr-9 py-2 text-xs sm:text-[13px] rounded-lg border border-zinc-300/80 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Badges Bar */}
        <div className="mt-7 flex flex-wrap items-center gap-2 pt-4 border-t border-zinc-100">
          <span className="text-[11px] font-mono uppercase text-zinc-400 mr-1 flex items-center gap-1.5">
            <Filter className="w-3 h-3" />
            {isEn ? 'Filter:' : 'Bộ lọc:'}
          </span>
          {filterOptions.map((opt) => {
            const isActive = activeFilter === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setActiveFilter(opt)}
                className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                    : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700'
                }`}
              >
                {opt}
              </button>
            );
          })}

          <div className="ml-auto text-xs font-mono text-zinc-400">
            {filteredProjects.length} {isEn ? 'projects' : 'dự án'}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-[1360px] mx-auto">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <Briefcase className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-zinc-800 mb-1">
              {isEn ? 'No projects found' : 'Không tìm thấy dự án phù hợp'}
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              {isEn
                ? 'Try adjusting your search query or filter tags.'
                : 'Thử tìm từ khóa khác hoặc đặt lại bộ lọc.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveFilter('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-zinc-900 text-white text-xs font-mono uppercase rounded hover:bg-black transition-all cursor-pointer"
            >
              {isEn ? 'Reset filters' : 'Đặt lại bộ lọc'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProjects.map((project) => {
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
                  onClick={() => setSelectedProject(project)}
                  className="group flex flex-col bg-white border border-zinc-200/80 rounded-xl overflow-hidden hover:border-zinc-400 hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  {/* Thumbnail Container */}
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

                    {/* Category Badge */}
                    {project.categoryBadge && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-black/80 backdrop-blur-xs text-white">
                          {project.categoryBadge}
                        </span>
                      </div>
                    )}

                    {/* Year pill */}
                    {project.year && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/90 backdrop-blur-xs text-zinc-800 border border-zinc-200">
                          {project.year}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
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

                    {/* Deliverables chips */}
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
        )}
      </section>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative border border-zinc-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-zinc-400 uppercase">
              {selectedProject.categoryBadge && (
                <span className="px-2 py-0.5 rounded bg-zinc-900 text-white font-semibold">
                  {selectedProject.categoryBadge}
                </span>
              )}
              {selectedProject.year && <span>• {selectedProject.year}</span>}
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl text-zinc-900 font-normal mb-2">
              {typeof selectedProject.title === 'object'
                ? isEn
                  ? selectedProject.title.en
                  : selectedProject.title.vi
                : selectedProject.title || selectedProject.name}
            </h2>

            <p className="text-zinc-500 text-xs sm:text-sm mb-5 font-mono">
              {typeof selectedProject.category === 'object'
                ? isEn
                  ? selectedProject.category.en
                  : selectedProject.category.vi
                : selectedProject.category}
            </p>

            {/* Featured Image */}
            <div className="aspect-[16/10] rounded-xl overflow-hidden bg-zinc-100 mb-6 border border-zinc-200/80">
              <img
                src={selectedProject.image}
                alt={selectedProject.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Project Specs */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200/60 mb-6 text-xs font-mono">
              <div>
                <span className="text-zinc-400 block mb-1 uppercase">{t.clientLabel || 'Khách hàng'}</span>
                <span className="font-semibold text-zinc-800">{selectedProject.client || 'Hiroki Studio'}</span>
              </div>
              <div>
                <span className="text-zinc-400 block mb-1 uppercase">{t.timelineLabel || 'Thời gian'}</span>
                <span className="font-semibold text-zinc-800">{selectedProject.timeline || '2024'}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                {isEn ? 'Overview' : 'Tổng quan dự án'}
              </h4>
              <p className="text-sm text-zinc-700 leading-relaxed font-sans">
                {typeof selectedProject.description === 'object'
                  ? isEn
                    ? selectedProject.description.en
                    : selectedProject.description.vi
                  : selectedProject.description}
              </p>
            </div>

            {/* Deliverables */}
            {selectedProject.deliverables && selectedProject.deliverables.length > 0 && (
              <div className="mb-8">
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2.5">
                  {t.deliverablesLabel || 'Hạng mục thực hiện'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.deliverables.map((item, idx) => (
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

            {/* Action Buttons */}
            <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-mono text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                {isEn ? 'Close' : 'Đóng'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const projName = selectedProject.name;
                  setSelectedProject(null);
                  onOpenContact(`Dự án: ${projName}`);
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-mono font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-xs"
              >
                {t.inquireBtn || 'LIÊN HỆ VỀ DỰ ÁN NÀY'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
