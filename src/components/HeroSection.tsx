import { Language, UI_TEXT } from '../data/content';
import { useCMS } from '../context/CMSContext';
import { getBadgeColorClasses, DEFAULT_TYPOGRAPHY_SETTINGS } from '../services/cmsService';
import { Tag, LayoutGrid, List, Search, X, RotateCcw, User, FileText, Sparkles, BookOpen } from 'lucide-react';

interface HeroSectionProps {
  lang: Language;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  activeBadges?: string[];
  onToggleBadge?: (badge: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  viewMode?: 'grid' | 'list';
  onToggleViewMode?: (mode: 'grid' | 'list') => void;
  filteredCount?: number;
}

export function HeroSection({
  lang,
  activeCategory,
  onSelectCategory,
  activeBadges = [],
  onToggleBadge,
  searchQuery = '',
  onSearchChange,
  viewMode = 'grid',
  onToggleViewMode,
  filteredCount,
}: HeroSectionProps) {
  const t = UI_TEXT[lang];
  const isEn = lang === 'en';
  const { siteSettings, categories, editorialTags } = useCMS();
  const typography = siteSettings?.typography || DEFAULT_TYPOGRAPHY_SETTINGS;

  const dynamicTitle = isEn
    ? siteSettings?.blog?.heroTitle_en || t.hero.title
    : siteSettings?.blog?.heroTitle_vi || t.hero.title;

  const dynamicSubtitle = isEn
    ? siteSettings?.blog?.heroSubtitle_en || t.hero.subtitle
    : siteSettings?.blog?.heroSubtitle_vi || t.hero.subtitle;

  // Filter categories for blog
  const blogCategories = (categories && categories.length > 0 ? categories : [])
    .filter((c) => c.target !== 'work' && c.showInHero !== false);

  const displayCategories = blogCategories.length > 0 ? blogCategories : [
    { id: 'cat-branding', name: 'BRANDING', label_vi: 'Xây dựng thương hiệu', label_en: 'Branding' },
    { id: 'cat-studio', name: 'STUDIO', label_vi: 'Đời sống Studio', label_en: 'Studio' },
    { id: 'cat-news', name: 'NEWS', label_vi: 'Tin tức', label_en: 'News' },
  ];

  // Dynamic editorial tags (BADGEs)
  const displayTags = editorialTags && editorialTags.length > 0 ? editorialTags : [
    { id: 'tag-editorial', name: 'EDITORIAL', color: 'dark' },
    { id: 'tag-essay', name: 'ESSAY', color: 'rose' },
    { id: 'tag-culture', name: 'CULTURE', color: 'amber' },
    { id: 'tag-typography', name: 'TYPOGRAPHY', color: 'indigo' },
    { id: 'tag-inspiration', name: 'INSPIRATION', color: 'emerald' },
  ];

  const isBadgeActive = (badgeName: string) => {
    if (badgeName === 'ALL') {
      return !activeBadges || activeBadges.length === 0;
    }
    return activeBadges.some((b) => b.toUpperCase() === badgeName.toUpperCase());
  };

  const hasActiveFilters = activeCategory !== 'ALL' || activeBadges.length > 0 || Boolean(searchQuery.trim());

  return (
    <section className="pt-12 pb-8 sm:pt-16 sm:pb-12 text-center max-w-4xl mx-auto px-6">
      {/* Editorial Title */}
      <h1
        style={{
          fontFamily: typography.h1FontFamily,
          fontSize: typography.h1CustomPx ? `clamp(36px, 8vw, ${typography.h1CustomPx}px)` : undefined,
        }}
        className="font-serif text-[40px] leading-[1.1] xs:text-6xl sm:text-7xl md:text-8xl font-normal text-zinc-900 tracking-tight sm:leading-none mb-4"
      >
        {dynamicTitle}
      </h1>

      {/* Subtitle */}
      <p className="text-zinc-600 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed font-normal mb-8 sm:mb-10">
        {dynamicSubtitle}
      </p>

      {/* Filter Systems Area */}
      <div className="space-y-4 max-w-3xl mx-auto">
        {/* Row 1: Category Filter Pill Bar */}
        <div className="flex flex-col items-center gap-2 pt-1">
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 bg-black text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded-full text-[11px] sm:text-xs font-semibold tracking-[0.14em] uppercase shadow-md select-none transition-all max-w-full">
            <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline-block pr-1 border-r border-zinc-800">
              {isEn ? 'CATEGORY' : 'CHUYÊN MỤC'}
            </span>

            {displayCategories.map((cat, index) => {
              const isActive = activeCategory.toUpperCase() === cat.name.toUpperCase();
              const label = isEn
                ? (cat.label_en || cat.name)
                : (cat.label_vi || cat.name);

              return (
                <div key={cat.id || cat.name} className="inline-flex items-center">
                  <button
                    onClick={() => onSelectCategory(isActive ? 'ALL' : cat.name)}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                      isActive
                        ? 'text-white bg-zinc-800 underline underline-offset-4 font-bold shadow-xs'
                        : 'text-zinc-300 hover:text-white'
                    }`}
                    title={cat.description || cat.name}
                  >
                    {label}
                  </button>

                  {index < displayCategories.length - 1 && (
                    <span className="text-zinc-600 px-1 select-none">/</span>
                  )}
                </div>
              );
            })}

            {activeCategory !== 'ALL' && (
              <button
                onClick={() => onSelectCategory('ALL')}
                className="ml-2 pl-2 border-l border-zinc-700 text-[10px] text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                title={isEn ? 'Clear category' : 'Xóa lọc chuyên mục'}
              >
                <span>✕</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: BADGE (Thẻ Nhãn) Multi-Select Filter Pills */}
        {onToggleBadge && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mr-1">
              <Tag size={13} className="text-zinc-500" />
              <span>{isEn ? 'BADGE:' : 'THẺ NHÃN:'}</span>
            </div>

            <button
              onClick={() => onToggleBadge('ALL')}
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
                  onClick={() => onToggleBadge(tag.name)}
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
        )}
      </div>

      {/* Row 3: Integrated Toolbar with Articles Count (Left), Search Box (Center), View Mode Toggle Grid/List (Right) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 pt-6 mt-6 border-t border-zinc-200/70 max-w-4xl mx-auto">
        {/* Left: Articles Count & Active Filter Indicator */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 flex-wrap justify-center md:justify-start shrink-0">
          <span className="font-serif italic font-medium text-zinc-800 text-sm">
            {typeof filteredCount === 'number' ? `${filteredCount} ${isEn ? 'articles' : 'bài viết'}` : ''}
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
                    onClick={() => onSearchChange && onSearchChange('')}
                    className="hover:text-rose-300 cursor-pointer ml-0.5"
                    title={isEn ? 'Remove keyword' : 'Xóa từ khóa'}
                  >
                    ✕
                  </button>
                </span>
              )}

              {activeCategory !== 'ALL' && (
                <span className="inline-flex items-center gap-1 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                  <span>{activeCategory}</span>
                  <button
                    onClick={() => onSelectCategory('ALL')}
                    className="hover:text-rose-300 cursor-pointer ml-0.5"
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
                    onClick={() => onToggleBadge && onToggleBadge(badge)}
                    className="hover:text-rose-300 cursor-pointer ml-0.5"
                    title={isEn ? `Remove tag ${badge}` : `Bỏ lọc nhãn ${badge}`}
                  >
                    ✕
                  </button>
                </span>
              ))}

              <button
                onClick={() => {
                  onSelectCategory('ALL');
                  if (onToggleBadge) onToggleBadge('ALL');
                  if (onSearchChange) onSearchChange('');
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

        {/* Center: Search Box Input (Thanh công cụ tìm kiếm đặt ở giữa) */}
        {onSearchChange && (
          <div className="w-full md:max-w-md mx-auto my-1 md:my-0 flex-1">
            <div className="relative flex items-center bg-zinc-50 hover:bg-white focus-within:bg-white border border-zinc-200/90 focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/10 rounded-full px-3.5 py-1.5 shadow-2xs transition-all">
              <Search size={15} className="text-zinc-500 shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={
                  isEn
                    ? 'Search by title, excerpt, author...'
                    : 'Tìm theo tiêu đề, mô tả ngắn, tác giả...'
                }
                className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="p-1 text-zinc-400 hover:text-zinc-800 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer ml-1 shrink-0"
                  title={isEn ? 'Clear search' : 'Xóa tìm kiếm'}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right: View Mode Toggle Controller (Grid vs List) */}
        {onToggleViewMode && (
          <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200/80 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => onToggleViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/60'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title={isEn ? 'Grid layout (2 columns)' : 'Xem dạng Lưới (2 cột)'}
            >
              <LayoutGrid size={14} />
              <span className="hidden xs:inline">{isEn ? 'Grid' : 'Lưới'}</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/60'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title={isEn ? 'List layout (Detailed rows)' : 'Xem dạng Danh sách (Hàng ngang)'}
            >
              <List size={14} />
              <span className="hidden xs:inline">{isEn ? 'List' : 'Danh sách'}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
