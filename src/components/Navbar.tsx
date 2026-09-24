import { useState, useRef, useEffect } from 'react';
import { Globe, User as UserIcon, LogOut, Settings2, ShieldCheck, ChevronDown, Type } from 'lucide-react';
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

  return (
    <header className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 pt-5 sm:pt-7 pb-4">
      {/* Horizontal Heading Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand Logo */}
        <div
          onClick={() => onSelectTab('home')}
          className="text-zinc-900 transition-opacity hover:opacity-85 cursor-pointer flex-shrink-0 flex items-center"
          title="góc Thương"
        >
          <HirokiLogo className="text-zinc-900" size={42} />
        </div>

        {/* Right: Horizontal Heading Navigation, Language Switcher & Account */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-end max-w-full">
          {/* Main Dark Horizontal Capsule Nav Bar */}
          <nav
            style={{
              fontFamily: currentNavFont,
              fontSize: `${typography.navFontSizePx || 12}px`,
            }}
            className="bg-black text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full sm:rounded-md flex items-center gap-2.5 sm:gap-5 md:gap-6 tracking-wider shadow-sm overflow-x-auto max-w-full"
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

          {/* Typography Customizer Quick Trigger Button (Admin Only) */}
          {isAdmin && (
            <button
              onClick={() => setTypographyModalOpen(true)}
              title={lang === 'en' ? 'Customize Font & Size (H1 & Nav)' : 'Tùy chỉnh Phông chữ & Cỡ chữ (H1 & Nav)'}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md border border-zinc-300 text-xs font-semibold text-zinc-800 hover:border-black hover:bg-zinc-100 transition-all cursor-pointer shadow-xs bg-white flex-shrink-0"
            >
              <Type size={14} className="text-zinc-700" />
              <span className="hidden sm:inline-block text-[11px] font-semibold">
                {lang === 'en' ? 'Font' : 'Phông chữ'}
              </span>
            </button>
          )}

          {/* Bilingual Language Switcher (EN / VI) */}
          <button
            onClick={onToggleLang}
            title={lang === 'en' ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md border border-zinc-300 text-xs font-semibold text-zinc-800 hover:border-black hover:bg-zinc-100 transition-all cursor-pointer shadow-xs bg-white flex-shrink-0"
          >
            <Globe size={13} className="text-zinc-500" />
            <span className={lang === 'en' ? 'font-bold text-black' : 'text-zinc-400'}>EN</span>
            <span className="text-zinc-300">/</span>
            <span className={lang === 'vi' ? 'font-bold text-black' : 'text-zinc-400'}>VI</span>
          </button>

          {/* User Authentication Trigger / Dropdown */}
          <div className="relative" ref={userMenuRef}>
            {user ? (
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md border border-zinc-300 hover:border-black bg-white text-xs font-medium text-zinc-900 transition-all cursor-pointer shadow-xs"
              >
                <div className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold">
                  {(userProfile?.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline-block max-w-[100px] truncate text-[11px] font-semibold">
                  {userProfile?.displayName || user.email?.split('@')[0]}
                </span>
                {isAdmin ? (
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-0.5">
                    <ShieldCheck size={10} />
                    <span>Admin</span>
                  </span>
                ) : (
                  <span className="text-[9px] uppercase font-medium tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                    User
                  </span>
                )}
                <ChevronDown size={12} className="text-zinc-400" />
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-md border border-zinc-900 bg-zinc-900 text-white hover:bg-black text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer shadow-xs"
              >
                <UserIcon size={13} />
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
    </header>
  );
}
