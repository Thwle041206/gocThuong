import { useState, useMemo, useEffect, useRef } from 'react';
import {
  ExternalLink,
  Plus,
  Share2,
  Tag,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
  Filter,
  Sparkles,
  Link as LinkIcon,
  Heart,
  Copy,
  CheckCircle2,
  SlidersHorizontal,
  FolderOpen,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  MessageSquare,
  User,
} from 'lucide-react';
import { Language } from '../data/content';
import { useCMS } from '../context/CMSContext';
import {
  CMSService,
  SharedResource,
  DEFAULT_SHARED_RESOURCES,
  DEFAULT_TYPOGRAPHY_SETTINGS,
} from '../services/cmsService';

interface ConnectViewProps {
  lang: Language;
  onOpenContact: (defaultService?: string) => void;
}

// Visual themes for mindmap tag branches matching the reference image
const TAG_THEMES: Record<
  string,
  {
    color: string;
    pillBg: string;
    lineColor: string;
    cardBorder: string;
    badgeBg: string;
    lightBg: string;
  }
> = {
  'UI/UX & Design': {
    color: '#14b8a6', // Teal
    pillBg: 'bg-teal-500 hover:bg-teal-600 text-white shadow-teal-500/20',
    lineColor: '#14b8a6',
    cardBorder: 'hover:border-teal-400/80',
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-200/80',
    lightBg: 'bg-teal-500/10 text-teal-700',
  },
  'Kỹ thuật & Web Dev': {
    color: '#8b5cf6', // Violet
    pillBg: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/20',
    lineColor: '#8b5cf6',
    cardBorder: 'hover:border-violet-400/80',
    badgeBg: 'bg-violet-50 text-violet-700 border-violet-200/80',
    lightBg: 'bg-violet-500/10 text-violet-700',
  },
  'Typography & Editorial': {
    color: '#f59e0b', // Amber
    pillBg: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20',
    lineColor: '#f59e0b',
    cardBorder: 'hover:border-amber-400/80',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200/80',
    lightBg: 'bg-amber-500/10 text-amber-800',
  },
  'AI & Công cụ Sáng tạo': {
    color: '#10b981', // Emerald
    pillBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
    lineColor: '#10b981',
    cardBorder: 'hover:border-emerald-400/80',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    lightBg: 'bg-emerald-500/10 text-emerald-800',
  },
  'Chiến lược & Nội dung': {
    color: '#0ea5e9', // Sky Blue
    pillBg: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-500/20',
    lineColor: '#0ea5e9',
    cardBorder: 'hover:border-sky-400/80',
    badgeBg: 'bg-sky-50 text-sky-800 border-sky-200/80',
    lightBg: 'bg-sky-500/10 text-sky-800',
  },
};

const DEFAULT_THEME = {
  color: '#6366f1',
  pillBg: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20',
  lineColor: '#6366f1',
  cardBorder: 'hover:border-indigo-400/80',
  badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  lightBg: 'bg-indigo-500/10 text-indigo-700',
};

export function ConnectView({ lang }: ConnectViewProps) {
  const isEn = lang === 'en';
  const { siteSettings } = useCMS();
  const typography = siteSettings?.typography || DEFAULT_TYPOGRAPHY_SETTINGS;

  // Resources state
  const [resources, setResources] = useState<SharedResource[]>(DEFAULT_SHARED_RESOURCES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Tag visibility state ("tag nào xem thì hiện không xem thì dropdown/ dropup để ẩn")
  const [visibleTags, setVisibleTags] = useState<Set<string>>(new Set());
  // Collapsed branches state for interactive on-canvas folding
  const [collapsedTags, setCollapsedTags] = useState<Set<string>>(new Set());
  // Dropdown open state for tag filter selector
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  // Modal share state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newCustomTag, setNewCustomTag] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch initial resources from Firestore / localStorage
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const data = await CMSService.fetchResources();
        if (mounted && data && data.length > 0) {
          setResources(data);
          // By default, make all tags visible
          const allTags = new Set(data.map((r) => r.tag));
          setVisibleTags(allTags);
        }
      } catch (e) {
        console.warn('Failed to load resources:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Close tag dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute all unique tags
  const allAvailableTags = useMemo(() => {
    const set = new Set<string>();
    resources.forEach((r) => {
      if (r.tag) set.add(r.tag);
    });
    return Array.from(set);
  }, [resources]);

  // Synchronize visibleTags when new tags appear
  useEffect(() => {
    if (visibleTags.size === 0 && allAvailableTags.length > 0) {
      setVisibleTags(new Set(allAvailableTags));
    }
  }, [allAvailableTags, visibleTags.size]);

  // Group resources by tag
  const groupedResources = useMemo(() => {
    const groups: Record<string, SharedResource[]> = {};
    const query = searchQuery.trim().toLowerCase();

    resources.forEach((item) => {
      // Filter by search query
      if (query) {
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchComment = item.comment.toLowerCase().includes(query);
        const matchTag = item.tag.toLowerCase().includes(query);
        const matchUrl = item.url.toLowerCase().includes(query);
        if (!matchTitle && !matchComment && !matchTag && !matchUrl) {
          return;
        }
      }

      // Check if tag is in visible tags
      if (!visibleTags.has(item.tag)) {
        return;
      }

      if (!groups[item.tag]) {
        groups[item.tag] = [];
      }
      groups[item.tag].push(item);
    });

    return groups;
  }, [resources, searchQuery, visibleTags]);

  const activeTagNames = Object.keys(groupedResources);

  // Toggle single tag visibility
  const handleToggleTagVisibility = (tag: string) => {
    setVisibleTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  // Toggle tag branch collapse on the mindmap
  const handleToggleBranchCollapse = (tag: string) => {
    setCollapsedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  // Select all or hide all tags
  const handleShowAllTags = () => {
    setVisibleTags(new Set(allAvailableTags));
  };

  const handleHideAllTags = () => {
    setVisibleTags(new Set());
  };

  const handleExpandAllBranches = () => {
    setCollapsedTags(new Set());
  };

  const handleCollapseAllBranches = () => {
    setCollapsedTags(new Set(allAvailableTags));
  };

  // Upvote resource
  const handleUpvote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newCount = await CMSService.upvoteResource(id);
      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, upvotes: newCount } : r))
      );
    } catch (err) {
      console.warn('Upvote failed:', err);
    }
  };

  // Copy link
  const handleCopyLink = (url: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Submit new resource
  const handleSubmitResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim() || !newComment.trim()) {
      alert(isEn ? 'Please fill in all required fields.' : 'Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    const tagToUse = newTag === '__custom__' ? newCustomTag.trim() : (newTag || allAvailableTags[0] || 'Tài nguyên chung');
    if (!tagToUse) {
      alert(isEn ? 'Please specify a tag.' : 'Vui lòng chọn hoặc nhập chủ đề thẻ.');
      return;
    }

    // Format URL with https if missing
    let formattedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    setIsSubmitting(true);
    try {
      const newResItem: SharedResource = {
        id: `res-${Date.now()}`,
        title: newTitle.trim(),
        url: formattedUrl,
        comment: newComment.trim(),
        tag: tagToUse,
        authorName: newAuthor.trim() || (isEn ? 'Community Contributor' : 'Thành viên chia sẻ'),
        createdAt: new Date().toISOString(),
        upvotes: 1,
      };

      const saved = await CMSService.saveResource(newResItem);
      setResources((prev) => [saved, ...prev]);
      setVisibleTags((prev) => new Set([...prev, tagToUse]));

      // Reset form
      setNewTitle('');
      setNewUrl('');
      setNewComment('');
      setNewTag(allAvailableTags[0] || '');
      setNewCustomTag('');
      setNewAuthor('');
      setIsShareModalOpen(false);

      // Toast feedback
      setToastMessage(isEn ? '✨ Your resource was shared successfully!' : '✨ Tài liệu của bạn đã được đăng thành công!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Failed to submit resource:', err);
      alert(isEn ? 'An error occurred while saving.' : 'Có lỗi xảy ra khi lưu tài liệu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const heroTitle = isEn
    ? siteSettings?.connect?.heroTitle_en || 'Knowledge Mindmap & Shared Resources'
    : siteSettings?.connect?.heroTitle_vi || 'Sơ đồ Tri thức & Kho Tài liệu Kết nối';

  const heroSubtitle = isEn
    ? siteSettings?.connect?.heroSubtitle_en ||
      'An open community mindmap connecting creative minds: explore, share, and organize curated web links, design systems, and tech articles.'
    : siteSettings?.connect?.heroSubtitle_vi ||
      'Không gian mở kết nối cộng đồng sáng tạo: cùng chia sẻ các nguồn tài liệu, thư viện thiết kế, công cụ và bài viết hay được phân nhánh theo chủ đề.';

  return (
    <div className="animate-in fade-in duration-300">
      {/* SINGLE UNIFIED SECTION (Replaces all 4 previous sections) */}
      <section className="px-4 sm:px-8 lg:px-12 pt-8 sm:pt-12 pb-0 max-w-[1440px] mx-auto">
        {/* Toast notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-zinc-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-zinc-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-zinc-400 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* 1. Header Banner & Mindmap Introduction */}
        <div className="mb-8 sm:mb-12">
          {/* Share CTA Row */}
          <div className="flex flex-wrap items-center justify-end gap-4 mb-4">
            <button
              type="button"
              onClick={() => {
                setNewTag(allAvailableTags[0] || '');
                setIsShareModalOpen(true);
              }}
              className="bg-black hover:bg-zinc-800 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide inline-flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus size={15} />
              <span>{isEn ? 'Share Resource' : 'Chia sẻ tài liệu'}</span>
            </button>
          </div>

          {/* Heading */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-end">
            <div className="lg:col-span-8">
              <h1
                style={{
                  fontFamily: typography.h1FontFamily,
                  fontSize: typography.h1CustomPx ? `clamp(29px, 6.4vw, ${Math.round(typography.h1CustomPx * 0.8)}px)` : undefined,
                }}
                className="font-serif text-[32px] leading-[1.15] xs:text-[48px] sm:text-[58px] md:text-[77px] font-normal text-zinc-900 tracking-tight sm:leading-none mb-3.5"
              >
                {isEn ? 'Shared Resources' : 'Tài nguyên cùng chia sẻ'}
              </h1>
            </div>
            <div className="lg:col-span-4">
              <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed font-sans max-w-lg">
                {heroSubtitle}
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                <span>📚 <strong>{resources.length}</strong> {isEn ? 'links shared' : 'tài liệu chia sẻ'}</span>
                <span>•</span>
                <span>🏷️ <strong>{allAvailableTags.length}</strong> {isEn ? 'active tags' : 'chủ đề / tags'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Search & Filter Bar */}
        <div className="bg-zinc-50/80 border border-zinc-200/90 rounded-2xl p-3 sm:p-4 mb-8 shadow-2xs backdrop-blur-xs">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? 'Search links, titles, comments or tags...' : 'Tìm kiếm tài liệu, lời bình, link, thẻ...'}
              className="w-full pl-9 pr-9 py-2 bg-white rounded-xl border border-zinc-200 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-800 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* 3. MAIN CONTENT: MINDMAP VIEW OR CARDS VIEW */}
        {activeTagNames.length === 0 ? (
          /* Empty / All Hidden State */
          <div className="text-center py-20 px-6 rounded-3xl bg-zinc-50 border border-dashed border-zinc-200 max-w-xl mx-auto my-12">
            <FolderOpen size={40} className="mx-auto text-zinc-400 mb-3" />
            <h3 className="font-serif text-2xl text-zinc-800 font-normal">
              {isEn ? 'No tags or resources currently visible' : 'Chưa có thẻ hoặc tài liệu nào được hiển thị'}
            </h3>
            <p className="text-xs text-zinc-500 mt-2 max-w-md mx-auto leading-relaxed">
              {searchQuery
                ? isEn
                  ? 'No shared resources matched your search keywords.'
                  : 'Không có tài liệu nào khớp với từ khóa tìm kiếm của bạn.'
                : isEn
                ? 'All tags are currently hidden by filter. Click "Show All" to explore the full mindmap.'
                : 'Các thẻ đã bị ẩn bởi bộ lọc. Hãy bấm "Hiện tất cả thẻ" để xem trọn vẹn sơ đồ.'}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 rounded-xl text-xs font-semibold text-zinc-800 transition-colors"
                >
                  {isEn ? 'Clear Search' : 'Xóa tìm kiếm'}
                </button>
              )}
              <button
                type="button"
                onClick={handleShowAllTags}
                className="px-4 py-2 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold tracking-wide transition-colors"
              >
                {isEn ? 'Show All Tags' : 'Hiện tất cả thẻ'}
              </button>
            </div>
          </div>
        ) : (
          /* ---------------- MINDMAP VIEW (Replicating image_0ddf7863.png) ---------------- */
          <div className="relative overflow-x-auto pb-8 pt-4 select-none">
            <div className="min-w-[980px] lg:min-w-[1180px] p-4 sm:p-6 bg-gradient-to-br from-zinc-50/70 via-white to-zinc-50/40 rounded-3xl border border-zinc-200/90 shadow-xs relative">
              {/* Watermark grid styling */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-3xl"
                style={{
                  backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Mindmap Tag Branches & Resource Nodes */}
              <div className="relative flex flex-col gap-6 sm:gap-8 z-10 w-full">
                {activeTagNames.map((tag) => {
                  const tagItems = groupedResources[tag] || [];
                  const isCollapsed = collapsedTags.has(tag);
                  const theme = TAG_THEMES[tag] || DEFAULT_THEME;

                  return (
                    <div key={tag} className="flex flex-col sm:flex-row items-start gap-4 sm:gap-8 relative group/tag">
                      {/* Subtopic Pill (Tag) */}
                      <div className="shrink-0 relative pt-1">
                        <div
                          onClick={() => handleToggleBranchCollapse(tag)}
                          className={`group/sub cursor-pointer px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm tracking-wide shadow-md transition-all duration-300 flex items-center gap-2.5 border border-white/20 hover:scale-105 ${theme.pillBg}`}
                          title={isCollapsed ? (isEn ? 'Click to expand' : 'Bấm để mở rộng') : (isEn ? 'Click to collapse' : 'Bấm để thu gọn')}
                        >
                          <span className="font-serif font-medium text-sm sm:text-base">
                            {tag}
                          </span>
                          <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-mono font-bold">
                            {tagItems.length}
                          </span>
                          {isCollapsed ? (
                            <ChevronDown size={14} className="opacity-80" />
                          ) : (
                            <ChevronUp size={14} className="opacity-80" />
                          )}
                        </div>

                        {/* Collapsed label */}
                        {isCollapsed && (
                          <span className="block text-[10px] text-zinc-400 mt-1 pl-3 font-mono italic">
                            ({tagItems.length} {isEn ? 'links hidden — click to view' : 'link đang ẩn — bấm mở'})
                          </span>
                        )}
                      </div>

                      {/* Child Resource Nodes (Level 2: list format, tối đa 2 dòng cho 1 div, padding nhỏ, style practical) */}
                      {!isCollapsed && (
                        <div className="flex-1 flex flex-col gap-1.5 w-full max-w-2xl sm:max-w-3xl pt-1 animate-in fade-in slide-in-from-left-2 duration-200">
                          {tagItems.map((item) => (
                            <div
                              key={item.id}
                              className="group/item bg-white hover:bg-zinc-50/95 rounded-lg px-3 py-1.5 border border-zinc-200/80 hover:border-zinc-300 shadow-2xs transition-all flex flex-col justify-center gap-0.5 relative text-left"
                              style={{ borderLeftWidth: '3px', borderLeftColor: theme.color }}
                            >
                              {/* Dòng 1: Tiêu đề nhỏ gắn link + actions (copy, upvote) */}
                              <div className="flex items-center justify-between gap-2 min-w-0">
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 font-medium text-xs sm:text-[13px] text-zinc-900 hover:text-zinc-950 hover:underline underline-offset-2 truncate"
                                  title={item.title}
                                >
                                  <span className="truncate">{item.title}</span>
                                  <ExternalLink size={11} className="shrink-0 text-zinc-400 group-hover/item:text-zinc-700 transition-colors" />
                                </a>

                                <div className="flex items-center gap-2 shrink-0 text-[10px] text-zinc-400">
                                  {item.authorName && (
                                    <span className="hidden sm:inline text-zinc-400 truncate max-w-[120px]">
                                      {item.authorName}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => handleCopyLink(item.url, item.id, e)}
                                    className="text-zinc-400 hover:text-zinc-700 p-0.5 rounded hover:bg-zinc-200/60 transition-colors"
                                    title={isEn ? 'Copy link' : 'Sao chép link'}
                                  >
                                    {copiedId === item.id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleUpvote(item.id, e)}
                                    className="inline-flex items-center gap-0.5 text-zinc-400 hover:text-rose-600 transition-colors"
                                    title={isEn ? 'Upvote' : 'Thích'}
                                  >
                                    <Heart size={10} className={item.upvotes && item.upvotes > 20 ? 'fill-rose-500 text-rose-500' : ''} />
                                    <span>{item.upvotes || 0}</span>
                                  </button>
                                </div>
                              </div>

                              {/* Dòng 2: Comment nhỏ gọn bên dưới (tối đa 1 dòng, đảm bảo toàn bộ div tối đa 2 dòng) */}
                              <p
                                className="text-[11px] text-zinc-500 truncate font-sans leading-tight"
                                title={item.comment}
                              >
                                {item.comment}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. MODAL: CHIA SẺ TÀI LIỆU MỚI (Share Resource Modal) */}
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-zinc-900 rounded-full hover:bg-zinc-100 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold tracking-wider uppercase mb-2 border border-teal-200/60">
                  <Share2 size={11} />
                  <span>{isEn ? 'COMMUNITY RESOURCE CONTRIBUTION' : 'ĐÓNG GÓP TÀI LIỆU CỘNG ĐỒNG'}</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl text-zinc-900 font-normal">
                  {isEn ? 'Share a Great Resource' : 'Chia sẻ tài liệu & link hay'}
                </h3>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  {isEn
                    ? 'Submit a helpful article, tool, or website. It will be mapped directly onto the interactive mindmap for everyone to learn.'
                    : 'Gửi bài viết, công cụ hoặc liên kết hữu ích. Tài liệu sẽ được gắn trực tiếp vào nhánh sơ đồ tư duy để mọi người cùng tra cứu.'}
                </p>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmitResource} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                    {isEn ? 'Resource Title' : 'Tiêu đề tài liệu'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={isEn ? 'e.g. Modern CSS Grid & Flexbox Guide' : 'Ví dụ: Hướng dẫn Design Tokens Figma thực chiến'}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-800"
                  />
                </div>

                {/* URL */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                    {isEn ? 'Link URL' : 'Đường dẫn liên kết (URL)'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <LinkIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="url"
                      required
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="https://example.com/great-resource"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-800"
                    />
                  </div>
                </div>

                {/* Tag Selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                    {isEn ? 'Category Tag (Mindmap Branch)' : 'Chủ đề Thẻ (Nhánh sơ đồ)'} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-800 cursor-pointer"
                  >
                    {allAvailableTags.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                    <option value="__custom__">
                      {isEn ? '+ Add new custom tag...' : '+ Tạo chủ đề thẻ mới...'}
                    </option>
                  </select>

                  {/* Custom tag input if selected */}
                  {newTag === '__custom__' && (
                    <input
                      type="text"
                      required
                      value={newCustomTag}
                      onChange={(e) => setNewCustomTag(e.target.value)}
                      placeholder={isEn ? 'Enter new tag name (e.g. Sách & Mindset)' : 'Nhập tên chủ đề mới (ví dụ: Sách & Tư duy)'}
                      className="mt-2 w-full px-3.5 py-2.5 bg-white border border-teal-300 rounded-xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    />
                  )}
                </div>

                {/* Comment / Annotation (Bên dưới link) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                    {isEn ? 'Comment / Takeaways (Short note under the link)' : 'Lời bình & Ghi chú chia sẻ (Comment nhỏ bên dưới)'} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={isEn ? 'Why is this resource useful? Key takeaways...' : 'Tại sao bạn đề xuất tài liệu này? Điểm hay nhất hoặc hướng dẫn áp dụng...'}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-800 resize-none"
                  />
                  <span className="text-[10px] text-zinc-400 block text-right mt-0.5">
                    {newComment.length}/500 ký tự
                  </span>
                </div>

                {/* Contributor Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1">
                    {isEn ? 'Your Name / Nickname' : 'Tên của bạn / Biệt danh'}
                  </label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder={isEn ? 'e.g. Hoài Thương' : 'Ví dụ: Hoài Thương (để trống sẽ hiển thị Thành viên)'}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-800"
                  />
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                  >
                    {isEn ? 'Cancel' : 'Hủy bỏ'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-black hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide shadow-sm transition-all inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>{isEn ? 'Publishing...' : 'Đang đăng...'}</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        <span>{isEn ? 'Share to Mindmap' : 'Đăng lên Sơ đồ'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
