import { useState, useRef, useEffect } from 'react';
import { Globe, User as UserIcon, LogOut, Settings2, ShieldCheck, ChevronDown, Type, Home, Briefcase, Layers, BookOpen, HeartHandshake, Mail, Menu, X } from 'lucide-react';
import { HirokiLogo } from './HirokiLogo';
import { Language, UI_TEXT } from '../data/content';
import { useAuth } from '../context/AuthContext';
import { useCMS } from '../context/CMSContext';
import { DEFAULT_TYPOGRAPHY_SETTINGS } from '../services/cmsService';
import { TypographyCustomizerModal } from './TypographyCustomizerModal';

interface NavbarProps {
  currentTab: 'home' | 'connect' | 'work' | 'blog' | 'services' | 'contact';
  onSelectTab: (tab: 'home' | 'connect' | 'work' | 'blog' | 'services' | 'contact') => void;
  lang: Language;
  onToggleLang: () => void;
  onOpenContact: () => void;
}

export function Navbar({
  currentTab,
  onSelectTab,
  lang,
  onToggleLang,
}: NavbarProps) {
  const t = UI_TEXT[lang];
  const { user, userProfile, isAdmin, logout, setIsAuthModalOpen } = useAuth();
  const { setIsAdminOpen, siteSettings } = useCMS();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [typographyModalOpen, setTypographyModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const typography = siteSettings?.typography || DEFAULT_TYPOGRAPHY_SETTINGS;
  const currentNavFont = typography.unifiedFont
    ? typography.h1FontFamily
    : typography.navFontFamily;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: Array<{ id: 'home' | 'work' | 'services' | 'blog' | 'connect' | 'contact'; label: string }> = [
    { id: 'home', label: t.nav.home },
    { id: 'work', label: t.nav.work },
    { id: 'services', label: t.nav.services || (lang === 'en' ? 'SERVICES' : 'DỊCH VỤ') },
    { id: 'blog', label: t.nav.blog },
    { id: 'connect', label: lang === 'vi' ? 'KẾT NỐI' : 'CONNECT' },
  ];

  const itemIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    home: Home,
    work: Briefcase,
    services: Layers,
    blog: BookOpen,
    connect: HeartHandshake,
    contact: Mail,
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-black lg:bg-white/85 backdrop-blur-md border-b border-zinc-900 lg:border-zinc-200/40 px-4 sm:px-8 lg:px-10 py-3 sm:py-4">
      {/* Horizontal Heading Navigation Bar */}
      <div className="max-w-[1400px] mx-auto flex flex-row items-center justify-between gap-3 sm:gap-6 w-full flex-nowrap">
        {/* Left: Brand Logo */}
        <div
          onClick={() => onSelectTab('home')}
          className="text-white lg:text-zinc-900 transition-opacity hover:opacity-85 cursor-pointer flex-shrink-0 flex items-center"
          title="góc Thương"
        >
          <HirokiLogo className="text-white lg:text-zinc-900" size={36} />
        </div>

        {/* Right: Responsive Navigation, Language Switcher & Account */}
        <div className="flex items-center gap-1.5 sm:gap-3 justify-end max-w-full">
          {/* Main Dark Horizontal Capsule Nav Bar (Desktop Only) */}
          <nav
            style={{
              fontFamily: currentNavFont,
              fontSize: `${typography.navFontSizePx || 12}px`,
            }}
            className="hidden lg:flex bg-black text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-full sm:rounded-md items-center gap-3 sm:gap-5 md:gap-6 tracking-wider shadow-sm overflow-x-auto"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  fontWeight: typography.navFontWeight || 'medium',
                }}
                className={`transition-colors uppercase hover:text-zinc-300 relative py-1 cursor-pointer whitespace-nowrap ${
                  currentTab === item.id ? 'text-white' : 'text-zinc-400'
                }`}
              >
                {item.label}
                {currentTab === item.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-white rounded-full" />
                )}
              </button>
            ))}

            {/* LET'S TALK / LIÊN HỆ Button (white pill inside black nav) */}
            <button
              onClick={() => onSelectTab('contact')}
              style={{
                fontWeight: typography.navFontWeight || 'semibold',
              }}
              className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded tracking-wider transition-colors whitespace-nowrap ml-1 cursor-pointer ${
                currentTab === 'contact'
                  ? 'bg-zinc-200 text-black shadow-inner'
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              {t.nav.letsTalk}
            </button>
          </nav>

          {/* Toggle Menu Button for Sidebar (Mobile & Tablet Only) */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            title={lang === 'en' ? 'Open Menu' : 'Mở Menu'}
            className="flex lg:hidden w-9 h-9 rounded-full bg-zinc-900 text-white items-center justify-center transition-all cursor-pointer hover:bg-zinc-850 border border-zinc-800 shadow-md"
          >
            <Menu size={18} />
          </button>

          {/* Typography Customizer Quick Trigger Button (Admin Only) */}
          {isAdmin && (
            <button
              onClick={() => setTypographyModalOpen(true)}
              title={lang === 'en' ? 'Customize Font & Size (H1 & Nav)' : 'Tùy chỉnh Phông chữ & Cỡ chữ (H1 & Nav)'}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md border border-zinc-800 md:border-zinc-300 text-xs font-semibold text-white md:text-zinc-800 hover:border-white md:hover:border-black hover:bg-zinc-900 md:hover:bg-zinc-100 transition-all cursor-pointer shadow-xs bg-black md:bg-white flex-shrink-0 animate-fade-in"
            >
              <Type size={14} className="text-zinc-300 lg:text-zinc-700" />
              <span className="hidden sm:inline-block text-[11px] font-semibold">
                {lang === 'en' ? 'Font' : 'Phông chữ'}
              </span>
            </button>
          )}

          {/* Bilingual Language Switcher (EN / VI) */}
          <button
            onClick={onToggleLang}
            title={lang === 'en' ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
            className="flex flex-col items-center justify-center px-2 py-1 rounded-md border border-zinc-800 lg:border-zinc-300 hover:border-white lg:hover:border-black hover:bg-zinc-900 lg:hover:bg-zinc-100 transition-all cursor-pointer shadow-xs bg-black lg:bg-white flex-shrink-0 min-w-[36px]"
          >
            <span className={`text-[10px] leading-tight font-semibold ${lang === 'en' ? 'font-bold text-white lg:text-black' : 'text-zinc-400'}`}>EN</span>
            <div className="w-4 h-[1px] bg-zinc-800 lg:bg-zinc-200 my-0.5" />
            <span className={`text-[10px] leading-tight font-semibold ${lang === 'vi' ? 'font-bold text-white lg:text-black' : 'text-zinc-400'}`}>VI</span>
          </button>

          {/* User Authentication Trigger / Dropdown */}
          <div className="relative" ref={userMenuRef}>
            {user ? (
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md border border-zinc-800 lg:border-zinc-300 hover:border-white lg:hover:border-black bg-zinc-900 lg:bg-white text-xs font-medium text-white lg:text-zinc-900 transition-all cursor-pointer shadow-xs"
              >
                <div className="w-5 h-5 rounded-full bg-white text-black lg:bg-zinc-900 lg:text-white flex items-center justify-center text-[10px] font-bold">
                  {(userProfile?.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline-block max-w-[100px] truncate text-[11px] font-semibold">
                  {userProfile?.displayName || user.email?.split('@')[0]}
                </span>
                {isAdmin ? (
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-950 text-amber-200 lg:bg-amber-100 lg:text-amber-900 border border-amber-800 lg:border-amber-300 flex items-center gap-0.5">
                    <ShieldCheck size={10} />
                    <span>Admin</span>
                  </span>
                ) : (
                  <span className="text-[9px] uppercase font-medium tracking-wider px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 lg:bg-zinc-100 lg:text-zinc-600">
                    User
                  </span>
                )}
                <ChevronDown size={12} className="text-zinc-400" />
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1 px-2 py-1.5 xs:gap-1.5 xs:px-3 xs:py-2 rounded-md border border-zinc-800 lg:border-zinc-900 bg-zinc-900 lg:bg-zinc-900 text-white hover:bg-black text-[10px] xs:text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer shadow-xs"
              >
                <UserIcon size={12} className="xs:size-[13px]" />
                <span>{lang === 'en' ? 'Sign In' : 'Đăng Nhập'}</span>
              </button>
            )}

            {/* Dropdown Menu */}
            {user && userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-zinc-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3.5 py-2 border-b border-zinc-100">
                  <p className="text-xs font-semibold text-zinc-900 truncate">
                    {userProfile?.displayName || 'Thành viên'}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                      Vai trò: {isAdmin ? 'Quản trị viên (Admin)' : 'Thành viên (User)'}
                    </span>
                  </div>
                </div>

                {/* If Admin: Quick Link to CMS */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setIsAdminOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-800 hover:bg-zinc-50 flex items-center gap-2 font-medium cursor-pointer transition-colors"
                  >
                    <Settings2 size={14} className="text-emerald-600" />
                    <span>Mở Bảng Quản Trị CMS</span>
                  </button>
                )}

                <button
                  onClick={async () => {
                    setUserMenuOpen(false);
                    await logout();
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium cursor-pointer transition-colors border-t border-zinc-100"
                >
                  <LogOut size={14} />
                  <span>{lang === 'en' ? 'Sign Out' : 'Đăng Xuất'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Typography Customizer Modal */}
      <TypographyCustomizerModal
        isOpen={typographyModalOpen}
        onClose={() => setTypographyModalOpen(false)}
        lang={lang}
      />

      {/* Sidebar Drawer from Left (Mobile & Tablet) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Dark Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in cursor-pointer"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar Content panel */}
          <div
            style={{
              fontFamily: currentNavFont,
            }}
            className="relative flex flex-col w-[280px] max-w-[85vw] h-full bg-black text-white shadow-2xl border-r border-zinc-900 p-6 z-10 transition-transform duration-300 animate-in slide-in-from-left"
          >
            {/* Top Header */}
            <div className="flex items-center justify-between pb-6 border-b border-zinc-900">
              <div
                onClick={() => {
                  onSelectTab('home');
                  setIsSidebarOpen(false);
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <HirokiLogo className="text-white" size={32} />
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Wrapper Div for navigation and profile info, background black */}
            <div className="flex flex-col justify-between flex-1 bg-black border border-zinc-900 rounded-xl p-4 mt-6">
              {/* Navigation Links */}
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const IconComponent = itemIcons[item.id] || Home;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm tracking-wider uppercase transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-zinc-900 text-white font-bold border border-zinc-800 shadow-md'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                      }`}
                    >
                      <IconComponent size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                {/* Special LET'S TALK / LIÊN HỆ Button */}
                <button
                  onClick={() => {
                    onSelectTab('contact');
                    setIsSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm tracking-wider uppercase transition-all mt-4 text-left cursor-pointer ${
                    currentTab === 'contact'
                      ? 'bg-zinc-900 text-white font-bold border border-zinc-800 shadow-md'
                      : 'bg-zinc-800 text-white hover:bg-zinc-700'
                  }`}
                >
                  <Mail size={16} />
                  <span>{t.nav.letsTalk}</span>
                </button>
              </nav>

              {/* Bottom Profile / Quick Info */}
              <div className="pt-4 border-t border-zinc-900 flex flex-col gap-3">
                {/* Language Switcher inside Drawer */}
                <div className="flex items-center justify-between text-xs text-zinc-400 px-2">
                  <span>{lang === 'en' ? 'Language' : 'Ngôn ngữ'}</span>
                  <button
                    onClick={() => {
                      onToggleLang();
                    }}
                    className="flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1.5 rounded-md text-white border border-zinc-900 cursor-pointer"
                  >
                    <Globe size={12} className="text-zinc-400" />
                    <span className={lang === 'en' ? 'font-bold' : ''}>EN</span>
                    <span>/</span>
                    <span className={lang === 'vi' ? 'font-bold' : ''}>VI</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
