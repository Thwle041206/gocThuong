import React from 'react';
import {
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  Github,
  Dribbble,
  Globe,
  ExternalLink,
  Sparkles,
  Mail,
  Send,
} from 'lucide-react';
import { HirokiLogo } from './HirokiLogo';
import { Language, UI_TEXT } from '../data/content';
import { useCMS } from '../context/CMSContext';
import { DEFAULT_FOOTER_SETTINGS, CMSFooterSocial, CMSFooterLinkItem } from '../services/cmsService';

interface FooterProps {
  lang: Language;
  onSelectTab: (tab: 'home' | 'connect' | 'work' | 'blog' | 'services' | 'contact') => void;
  onOpenContact: () => void;
  onOpenUtility: (title: string, desc: string) => void;
}

export function Footer({
  lang,
  onSelectTab,
  onOpenContact,
  onOpenUtility,
}: FooterProps) {
  const t = UI_TEXT[lang];
  const { siteSettings, setIsAdminOpen } = useCMS();

  const footer = siteSettings?.footer || DEFAULT_FOOTER_SETTINGS;

  const brandSubText =
    footer.brandSub?.[lang] ||
    (lang === 'en'
      ? 'An Editorial & Bespoke Creative Journal. Crafted for discerning agencies, studios, and independent creative directors.'
      : 'Tạp chí & Không gian Sáng tạo Độc bản. Kiến tạo cho các agency, studio và giám đốc sáng tạo độc lập.');

  const visibleSocials = (footer.socials || DEFAULT_FOOTER_SETTINGS.socials).filter(
    (s) => s.isVisible !== false
  );

  const visibleColumns = (footer.columns || DEFAULT_FOOTER_SETTINGS.columns).filter(
    (c) => c.isVisible !== false
  );

  const ctaBtn = footer.ctaButton || DEFAULT_FOOTER_SETTINGS.ctaButton;

  const renderSocialIcon = (social: CMSFooterSocial) => {
    const platform = (social.platform || '').toLowerCase();
    switch (platform) {
      case 'instagram':
        return <Instagram size={15} />;
      case 'twitter':
        return <Twitter size={15} />;
      case 'behance':
        return <span className="font-bold text-xs">Bē</span>;
      case 'pinterest':
        return <span className="font-serif font-bold text-sm">P</span>;
      case 'facebook':
        return <Facebook size={15} />;
      case 'linkedin':
        return <Linkedin size={15} />;
      case 'youtube':
        return <Youtube size={15} />;
      case 'github':
        return <Github size={15} />;
      case 'dribbble':
        return <Dribbble size={15} />;
      case 'gmail':
      case 'email':
      case 'mail':
        return <Mail size={15} />;
      case 'telegram':
        return <Send size={15} />;
      default:
        return <Globe size={15} />;
    }
  };

  const handleLinkClick = (link: CMSFooterLinkItem) => {
    if (link.type === 'tab') {
      const validTabs = ['home', 'connect', 'work', 'blog', 'services', 'contact'];
      if (validTabs.includes(link.target)) {
        onSelectTab(link.target as any);
      } else {
        onSelectTab('home');
      }
    } else if (link.type === 'admin') {
      setIsAdminOpen(true);
    } else if (link.type === 'utility') {
      const modalTitle =
        link.utilityContent?.title?.[lang] ||
        link.label?.[lang] ||
        (lang === 'en' ? 'Information' : 'Thông tin');
      const modalDesc =
        link.utilityContent?.desc?.[lang] ||
        (lang === 'en'
          ? 'Detailed information is being updated.'
          : 'Nội dung chi tiết đang được cập nhật.');
      onOpenUtility(modalTitle, modalDesc);
    } else if (link.type === 'external') {
      if (link.target) {
        window.open(link.target, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleCtaClick = () => {
    if (!ctaBtn) return;
    if (ctaBtn.type === 'tab') {
      const validTabs = ['home', 'connect', 'work', 'blog', 'services', 'contact'];
      if (validTabs.includes(ctaBtn.target)) {
        onSelectTab(ctaBtn.target as any);
      }
    } else if (ctaBtn.type === 'external') {
      if (ctaBtn.target) {
        window.open(ctaBtn.target, '_blank', 'noopener,noreferrer');
      }
    } else {
      // Default: utility modal
      const title =
        ctaBtn.utilityContent?.title?.[lang] ||
        ctaBtn.label?.[lang] ||
        (lang === 'en' ? 'More Templates' : 'Thêm Giao Diện Khác');
      const desc =
        ctaBtn.utilityContent?.desc?.[lang] ||
        (lang === 'en'
          ? 'Discover more high-end editorial Webflow and React templates designed by Gola Templates.'
          : 'Khám phá thêm các mẫu giao diện Webflow và React cao cấp khác từ Gola Templates.');
      onOpenUtility(title, desc);
    }
  };

  return (
    <footer className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 mb-8 mt-24">
      <div className="bg-black text-white rounded-3xl p-8 sm:p-14 lg:p-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Info & Socials (takes 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-6">
            <div onClick={() => onSelectTab('home')} className="inline-block cursor-pointer">
              <HirokiLogo className="text-white" size={36} />
            </div>

            <p className="text-zinc-400 text-xs sm:text-sm font-sans max-w-sm leading-relaxed">
              {brandSubText}
            </p>

            {/* Social Icons */}
            {visibleSocials.length > 0 && (
              <div className="flex items-center flex-wrap gap-2.5 pt-2">
                {visibleSocials.map((social) => (
                  <a
                    key={social.id}
                    href={social.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label || social.platform}
                    title={social.label || social.platform}
                    className="w-9 h-9 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-900 transition-colors"
                  >
                    {renderSocialIcon(social)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Link Columns */}
          {visibleColumns.map((column, colIdx) => {
            const visibleLinks = (column.links || []).filter((l) => l.isVisible !== false);

            return (
              <div key={column.id || `col-${colIdx}`} className="space-y-4">
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  {column.title?.[lang] || column.title?.vi || column.title?.en || ''}
                </h4>

                <ul className="space-y-3 text-xs tracking-wider uppercase font-medium text-zinc-300">
                  {visibleLinks.map((link) => {
                    const linkLabel =
                      link.label?.[lang] || link.label?.vi || link.label?.en || 'LINK';

                    if (link.type === 'external') {
                      return (
                        <li key={link.id}>
                          <a
                            href={link.target}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <span>{linkLabel}</span>
                            <ExternalLink size={10} className="text-zinc-500" />
                          </a>
                        </li>
                      );
                    }

                    if (link.type === 'admin' || link.highlight) {
                      return (
                        <li key={link.id}>
                          <button
                            onClick={() => handleLinkClick(link)}
                            className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer text-left flex items-center gap-1.5 pt-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>{linkLabel}</span>
                          </button>
                        </li>
                      );
                    }

                    return (
                      <li key={link.id}>
                        <button
                          onClick={() => handleLinkClick(link)}
                          className="hover:text-white transition-colors cursor-pointer text-left"
                        >
                          {linkLabel}
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {/* Show CTA button in Column 1 (like original design) if configured */}
                {colIdx === 0 && ctaBtn && ctaBtn.isVisible !== false && (
                  <div className="pt-2">
                    <button
                      onClick={handleCtaClick}
                      className="bg-white text-black px-4 py-2 rounded text-[10px] font-bold tracking-widest uppercase hover:bg-zinc-200 transition-colors cursor-pointer"
                    >
                      {ctaBtn.label?.[lang] || ctaBtn.label?.vi || ctaBtn.label?.en || 'MORE TEMPLATES'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom subtle copyright hairline */}
        <div className="mt-14 pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>
            {footer.copyright?.[lang] ||
              footer.copyright?.vi ||
              t.footer.copyright}
          </p>

          <div className="flex items-center gap-4 text-zinc-400 text-[11px] uppercase tracking-wider">
            {(footer.locations && footer.locations.length > 0
              ? footer.locations
              : ['Tokyo', 'Hanoi', 'New York']
            ).map((city, idx, arr) => (
              <React.Fragment key={idx}>
                <span>{city}</span>
                {idx < arr.length - 1 && <span>·</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
