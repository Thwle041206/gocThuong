import { useState, useMemo, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ArticleCard } from './components/ArticleCard';
import { ArticleListItem } from './components/ArticleListItem';
import { ArticleReader } from './components/ArticleReader';
import { HomeView } from './components/HomeView';
import { ConnectView } from './components/ConnectView';
import { WorkView } from './components/WorkView';
import { ServicesView } from './components/ServicesView';
import { ContactView } from './components/ContactView';
import { ContactModal } from './components/ContactModal';
import { UtilityModal } from './components/UtilityModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { AdminCMS } from './components/AdminCMS';
import { CMSProvider, useCMS } from './context/CMSContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Article, ARTICLES, Language } from './data/content';
import { Settings2 } from 'lucide-react';

export type AppTab = 'home' | 'connect' | 'work' | 'blog' | 'services' | 'contact';

// Map tab to primary clean URL slug (Vietnamese)
export const TAB_TO_PATH: Record<AppTab, string> = {
  home: '/',
  work: '/du-an',
  services: '/dich-vu',
  blog: '/bai-viet',
  connect: '/ket-noi',
  contact: '/lien-he',
};

// Aliases mapping path to tab (supporting both Vietnamese and English routes)
export const PATH_TO_TAB: Record<string, AppTab> = {
  '/': 'home',
  '/home': 'home',
  '/trang-chu': 'home',
  '/du-an': 'work',
  '/work': 'work',
  '/projects': 'work',
  '/dich-vu': 'services',
  '/services': 'services',
  '/bai-viet': 'blog',
  '/blog': 'blog',
  '/articles': 'blog',
  '/ket-noi': 'connect',
  '/connect': 'connect',
  '/lien-he': 'contact',
  '/contact': 'contact',
};

function MainApp() {
  const [lang, setLang] = useState<Language>('vi');
  const [currentTab, setCurrentTab] = useState<AppTab>('home');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [activeBadges, setActiveBadges] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hirokistudio_blog_view_mode');
      if (saved === 'list' || saved === 'grid') return saved;
    }
    return 'grid';
  });

  const handleToggleViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hirokistudio_blog_view_mode', mode);
    }
  };

  const handleToggleBadge = (badge: string) => {
    setCurrentPage(1);
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

  const handleSelectCategory = (cat: string) => {
    setCurrentPage(1);
    setActiveCategory(cat);
  };

  const handleSearchChange = (query: string) => {
    setCurrentPage(1);
    setSearchQuery(query);
  };
  const [contactOpen, setContactOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<string | undefined>();
  const [utilityModal, setUtilityModal] = useState<{ isOpen: boolean; title: string; desc: string }>({
    isOpen: false,
    title: '',
    desc: ''
  });

  const { publishedPosts, isAdminOpen, setIsAdminOpen } = useCMS();
  const { isAdmin, isAuthModalOpen, setIsAuthModalOpen } = useAuth();

  // Dynamic posts from CMS (or fallback to ARTICLES)
  const currentPosts = useMemo(() => {
    return publishedPosts && publishedPosts.length > 0 ? publishedPosts : ARTICLES;
  }, [publishedPosts]);

  // Sync state from current window.location.pathname
  const syncStateFromLocation = useCallback(() => {
    if (typeof window === 'undefined') return;
    const pathname = window.location.pathname.replace(/\/+$/, '') || '/';

    // Check if URL is reading an article: /bai-viet/:id or /blog/:id
    const articleMatch = pathname.match(/^\/(?:bai-viet|blog)\/(.+)$/i);
    if (articleMatch && articleMatch[1]) {
      const articleId = decodeURIComponent(articleMatch[1]);
      const found = currentPosts.find(
        (a) => a.id.toLowerCase() === articleId.toLowerCase()
      );
      if (found) {
        setSelectedArticle(found);
        setCurrentTab('blog');
        return;
      }
    }

    // Check if URL is /admin or /cms
    if (pathname === '/admin' || pathname === '/cms') {
      if (isAdmin) {
        setIsAdminOpen(true);
      } else {
        setIsAuthModalOpen(true);
      }
      return;
    }

    // Check if route matches standard heading tabs
    const matchedTab = PATH_TO_TAB[pathname.toLowerCase()];
    if (matchedTab) {
      setCurrentTab(matchedTab);
      setSelectedArticle(null);
    } else if (pathname === '/') {
      setCurrentTab('home');
      setSelectedArticle(null);
    }
  }, [currentPosts, isAdmin, setIsAdminOpen, setIsAuthModalOpen]);

  // Handle popstate (Browser Back / Forward buttons)
  useEffect(() => {
    syncStateFromLocation();

    const handlePopState = () => {
      syncStateFromLocation();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [syncStateFromLocation]);

  // Update document title based on current view & language
  useEffect(() => {
    const brandName = 'góc Thương';
    if (selectedArticle) {
      const title = selectedArticle.title[lang] || selectedArticle.title.vi;
      document.title = `${title} | ${brandName}`;
    } else {
      switch (currentTab) {
        case 'work':
          document.title = lang === 'en' ? `Projects | ${brandName}` : `Dự án | ${brandName}`;
          break;
        case 'services':
          document.title = lang === 'en' ? `Services | ${brandName}` : `Dịch vụ | ${brandName}`;
          break;
        case 'blog':
          document.title = lang === 'en' ? `Articles & Stories | ${brandName}` : `Bài viết & Ấn phẩm | ${brandName}`;
          break;
        case 'connect':
          document.title = lang === 'en' ? `Connect | ${brandName}` : `Kết nối | ${brandName}`;
          break;
        case 'contact':
          document.title = lang === 'en' ? `Contact Us | ${brandName}` : `Liên hệ | ${brandName}`;
          break;
        case 'home':
        default:
          document.title = `${brandName} | Tạp chí & Không gian Sáng tạo Độc bản`;
          break;
      }
    }
  }, [currentTab, selectedArticle, lang]);

  // Shortcut Alt + A to toggle CMS Admin (Only opens if isAdmin; otherwise prompts Admin Login)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        if (isAdmin) {
          setIsAdminOpen(!isAdminOpen);
        } else {
          setIsAuthModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin, isAdminOpen, setIsAdminOpen, setIsAuthModalOpen]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'vi' : 'en'));
  };

  const handleOpenContact = (service?: string) => {
    setPreselectedService(service);
    setContactOpen(true);
  };

  // Navigating between tabs
  const handleSelectTab = (tab: AppTab) => {
    setCurrentTab(tab);
    setSelectedArticle(null);

    const targetPath = TAB_TO_PATH[tab] || '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Opening an article reader
  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
    const targetPath = `/bai-viet/${encodeURIComponent(article.id)}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back from article reader
  const handleBackFromArticle = () => {
    setSelectedArticle(null);
    const targetPath = TAB_TO_PATH['blog'];
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return currentPosts.filter((a) => {
      const matchCat =
        activeCategory === 'ALL' ||
        (a.category || '').toUpperCase() === activeCategory.toUpperCase();

      const matchBadge =
        activeBadges.length === 0 ||
        activeBadges.some(
          (b) => b.toUpperCase() === 'ALL' || b.toUpperCase() === (a.tag || '').toUpperCase()
        );

      if (!matchCat || !matchBadge) return false;

      if (!q) return true;

      const titleVi = (a.title?.vi || '').toLowerCase();
      const titleEn = (a.title?.en || '').toLowerCase();
      const excerptVi = (a.excerpt?.vi || '').toLowerCase();
      const excerptEn = (a.excerpt?.en || '').toLowerCase();
      const author = (a.author?.name || '').toLowerCase();
      const category = (a.category || '').toLowerCase();
      const tag = (a.tag || '').toLowerCase();
      const contentVi = (typeof a.content?.vi === 'string' ? a.content.vi : JSON.stringify(a.content?.vi || '')).toLowerCase();
      const contentEn = (typeof a.content?.en === 'string' ? a.content.en : JSON.stringify(a.content?.en || '')).toLowerCase();

      return (
        titleVi.includes(q) ||
        titleEn.includes(q) ||
        excerptVi.includes(q) ||
        excerptEn.includes(q) ||
        author.includes(q) ||
        category.includes(q) ||
        tag.includes(q) ||
        contentVi.includes(q) ||
        contentEn.includes(q)
      );
    });
  }, [activeCategory, activeBadges, searchQuery, currentPosts]);

  // 10 Articles / Page Pagination calculation
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedArticles = useMemo(() => {
    const startIdx = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredArticles.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredArticles, safePage]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-white relative">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        lang={lang}
        onToggleLang={toggleLanguage}
        onOpenContact={() => setContactOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto">
        {selectedArticle ? (
          /* Single Article Reader View */
          <ArticleReader
            article={selectedArticle}
            lang={lang}
            onBack={handleBackFromArticle}
            onSelectArticle={handleSelectArticle}
            onToggleLang={toggleLanguage}
          />
        ) : currentTab === 'home' ? (
          /* New Editorial Homepage */
          <HomeView
            lang={lang}
            onNavigate={handleSelectTab}
            onSelectArticle={handleSelectArticle}
            onOpenContact={() => setContactOpen(true)}
          />
        ) : currentTab === 'connect' ? (
          /* Connect Page */
          <ConnectView
            lang={lang}
            onOpenContact={() => setContactOpen(true)}
          />
        ) : currentTab === 'blog' ? (
          /* Blog Grid / List View */
          <div>
            <HeroSection
              lang={lang}
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategory}
              activeBadges={activeBadges}
              onToggleBadge={handleToggleBadge}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              viewMode={viewMode}
              onToggleViewMode={handleToggleViewMode}
              filteredCount={filteredArticles.length}
            />

            {/* Articles Presentation Section (Grid or List View) */}
            <section className="px-4 sm:px-6 max-w-4xl mx-auto pb-16">
              {viewMode === 'grid' ? (
                /* 2-Column Editorial Grid View (Constrained to max-w-4xl to match List view width) */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-10 sm:gap-y-12 animate-in fade-in duration-300">
                  {paginatedArticles.map((article, idx) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      lang={lang}
                      onRead={handleSelectArticle}
                      priorityOverlay={idx === 0 && safePage === 1}
                    />
                  ))}
                </div>
              ) : (
                /* Editorial List View */
                <div className="flex flex-col gap-4 sm:gap-5 animate-in fade-in duration-300">
                  {paginatedArticles.map((article) => (
                    <ArticleListItem
                      key={article.id}
                      article={article}
                      lang={lang}
                      onRead={handleSelectArticle}
                    />
                  ))}
                </div>
              )}

              {filteredArticles.length === 0 && (
                <div className="text-center py-20 text-zinc-400 bg-zinc-50/60 rounded-3xl border border-dashed border-zinc-200 max-w-2xl mx-auto mt-6 px-6">
                  <p className="font-serif text-2xl text-zinc-700">
                    {lang === 'en'
                      ? 'No articles match your search or filters'
                      : 'Không tìm thấy bài viết nào phù hợp với tìm kiếm hoặc bộ lọc'}
                  </p>
                  <p className="text-xs text-zinc-500 mt-2 max-w-md mx-auto">
                    {lang === 'en'
                      ? 'Try adjusting your search keyword or clearing the filters to explore all editorial stories.'
                      : 'Hãy thử đổi từ khóa tìm kiếm hoặc xóa các bộ lọc để khám phá toàn bộ bài viết.'}
                  </p>
                  <button
                    onClick={() => {
                      setActiveCategory('ALL');
                      setActiveBadges([]);
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs uppercase font-semibold bg-black text-white hover:bg-zinc-800 transition-all cursor-pointer shadow-xs"
                  >
                    <span>{lang === 'en' ? 'Reset all filters & search' : 'Xóa tìm kiếm & bộ lọc'}</span>
                  </button>
                </div>
              )}

              {/* Pagination Controls Section (Khi có 10 bài viết trở lên / nhiều trang) */}
              {filteredArticles.length > 0 && totalPages > 1 && (
                <div className="mt-14 pt-8 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Page Info */}
                  <div className="text-xs text-zinc-500 font-medium">
                    {lang === 'en' ? (
                      <span>
                        Showing <strong className="text-zinc-900">{(safePage - 1) * ITEMS_PER_PAGE + 1}</strong>–
                        <strong className="text-zinc-900">{Math.min(safePage * ITEMS_PER_PAGE, filteredArticles.length)}</strong> of{' '}
                        <strong className="text-zinc-900">{filteredArticles.length}</strong> articles
                      </span>
                    ) : (
                      <span>
                        Hiển thị <strong className="text-zinc-900">{(safePage - 1) * ITEMS_PER_PAGE + 1}</strong>–
                        <strong className="text-zinc-900">{Math.min(safePage * ITEMS_PER_PAGE, filteredArticles.length)}</strong> trong tổng số{' '}
                        <strong className="text-zinc-900">{filteredArticles.length}</strong> bài viết (10 bài/trang)
                      </span>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="inline-flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200/80 shadow-2xs">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => {
                        setCurrentPage((prev) => Math.max(prev - 1, 1));
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white text-zinc-700"
                    >
                      {lang === 'en' ? '← Prev' : '← Trước'}
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => {
                          setCurrentPage(pageNum);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          pageNum === safePage
                            ? 'bg-black text-white shadow-xs'
                            : 'text-zinc-600 hover:bg-white hover:text-zinc-900'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => {
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white text-zinc-700"
                    >
                      {lang === 'en' ? 'Next →' : 'Sau →'}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        ) : currentTab === 'work' ? (
          <WorkView lang={lang} onOpenContact={(service) => handleOpenContact(service)} />
        ) : currentTab === 'contact' ? (
          <ContactView lang={lang} />
        ) : (
          <ServicesView lang={lang} onOpenContact={() => handleOpenContact()} />
        )}
      </main>

      {/* Footer */}
      <Footer
        lang={lang}
        onSelectTab={handleSelectTab}
        onOpenContact={() => handleOpenContact()}
        onOpenUtility={(title, desc) => setUtilityModal({ isOpen: true, title, desc })}
      />

      {/* Floating CMS Admin Access Button - ONLY VISIBLE IF ADMIN */}
      {isAdmin && (
        <button
          onClick={() => setIsAdminOpen(true)}
          className="fixed bottom-5 right-5 z-40 bg-zinc-950 text-white hover:bg-black px-4 py-2.5 rounded-full shadow-2xl border border-zinc-800 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase transition-all hover:scale-105 cursor-pointer group"
          title="Mở bảng điều khiển quản trị CMS (Phím tắt: Alt + A)"
        >
          <Settings2 size={16} className="text-emerald-400 group-hover:rotate-45 transition-transform" />
          <span>Quản Trị CMS</span>
          <kbd className="hidden sm:inline-block bg-zinc-800 text-[10px] text-zinc-400 px-1.5 py-0.5 rounded font-mono">
            Alt+A
          </kbd>
        </button>
      )}

      {/* Full-screen Admin CMS Studio Modal - Guarded for admin */}
      {isAdmin && isAdminOpen && (
        <AdminCMS onClose={() => setIsAdminOpen(false)} />
      )}

      {/* Interactive Contact Drawer / Modal ("LET'S TALK") */}
      <ContactModal
        isOpen={contactOpen}
        onClose={() => {
          setContactOpen(false);
          setPreselectedService(undefined);
        }}
        lang={lang}
        defaultService={preselectedService}
      />

      {/* Utility Pages Modal */}
      <UtilityModal
        isOpen={utilityModal.isOpen}
        onClose={() => setUtilityModal({ isOpen: false, title: '', desc: '' })}
        title={utilityModal.title}
        description={utilityModal.desc}
        lang={lang}
      />

      {/* User Login & Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CMSProvider>
        <MainApp />
      </CMSProvider>
    </AuthProvider>
  );
}
