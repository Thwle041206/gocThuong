import { ArrowUpRight, Instagram, Twitter, Pin, Briefcase } from 'lucide-react';
import { Language, UI_TEXT } from '../data/content';
import { useCMS } from '../context/CMSContext';
import { DEFAULT_TYPOGRAPHY_SETTINGS } from '../services/cmsService';

interface ConnectViewProps {
  lang: Language;
  onOpenContact: (defaultService?: string) => void;
}

export function ConnectView({ lang, onOpenContact }: ConnectViewProps) {
  const t = UI_TEXT[lang].connectSection;
  const isEn = lang === 'en';
  const { siteSettings } = useCMS();
  const typography = siteSettings?.typography || DEFAULT_TYPOGRAPHY_SETTINGS;

  const heroTitle = isEn
    ? siteSettings?.connect?.heroTitle_en || t.heroTitle
    : siteSettings?.connect?.heroTitle_vi || t.heroTitle;

  const heroSubtitle = isEn
    ? siteSettings?.connect?.heroSubtitle_en || t.heroSubtitle
    : siteSettings?.connect?.heroSubtitle_vi || t.heroSubtitle;

  const missionTitle = isEn
    ? siteSettings?.connect?.missionTitle_en || t.missionTitle
    : siteSettings?.connect?.missionTitle_vi || t.missionTitle;

  return (
    <div className="animate-in fade-in duration-300">
      {/* 1. HERO SECTION */}
      <section className="px-6 sm:px-10 lg:px-12 pt-8 sm:pt-14 pb-12 sm:pb-20 max-w-[1360px] mx-auto">
        {/* Top Text Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start mb-10 sm:mb-14">
          <div className="lg:col-span-8">
            <h1
              style={{
                fontFamily: typography.h1FontFamily,
                fontSize: typography.h1CustomPx ? `clamp(32px, 6vw, ${typography.h1CustomPx}px)` : undefined,
              }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[76px] text-zinc-900 font-normal leading-[1.05] tracking-tight text-balance"
            >
              {heroTitle}
            </h1>
          </div>
          <div className="lg:col-span-4 lg:pt-3">
            <p className="text-zinc-600 text-sm sm:text-base leading-relaxed font-sans max-w-md">
              {heroSubtitle}
            </p>
          </div>
        </div>

        {/* Dual Hero Images Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* Left Wide Collaboration Image */}
          <div className="md:col-span-7 rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-200/80 shadow-xs group bg-zinc-100 min-h-[320px] sm:min-h-[440px]">
            <img
              src="/src/assets/images/team_hero_collab_1790135062529.jpg"
              alt="Team Collaboration at Hiroki"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
            />
          </div>

          {/* Right Portrait Focused Creative Image */}
          <div className="md:col-span-5 rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-200/80 shadow-xs group bg-zinc-100 min-h-[320px] sm:min-h-[440px]">
            <img
              src="/src/assets/images/creative_man_notebook_1790135085678.jpg"
              alt="Creative Strategy and Focus"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
            />
          </div>
        </div>
      </section>

      {/* 2. OUR MISSION SECTION */}
      <section className="px-6 sm:px-10 lg:px-12 py-12 sm:py-20 max-w-[1360px] mx-auto border-t border-zinc-200/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Eyebrow Label */}
          <div className="lg:col-span-3">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-400 block sticky top-24">
              {t.missionBadge}
            </span>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-9 space-y-8 sm:space-y-10">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-zinc-900 font-normal leading-[1.15] max-w-3xl">
              {t.missionTitle}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 text-zinc-600 text-sm sm:text-[14.5px] leading-relaxed">
              <p>{t.missionCol1}</p>
              <p>{t.missionCol2}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. METRICS / STATS DARK BAR */}
      <section className="px-6 sm:px-10 lg:px-12 py-6 sm:py-10 max-w-[1360px] mx-auto">
        <div className="bg-black text-white rounded-2xl p-8 sm:p-12 shadow-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
            {t.stats.map((st, idx) => (
              <div
                key={st.label}
                className={`flex flex-col justify-between ${
                  idx !== 0 ? 'lg:border-l lg:border-zinc-800 lg:pl-8' : ''
                } ${idx !== t.stats.length - 1 ? 'lg:pr-8' : ''}`}
              >
                <div>
                  <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-400 block mb-3 font-sans">
                    {st.label}
                  </span>
                  <div className="font-serif text-4xl sm:text-5xl text-white font-normal mb-3">
                    {st.value}
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. OUR TEAM SECTION */}
      <section className="px-6 sm:px-10 lg:px-12 py-14 sm:py-24 max-w-[1360px] mx-auto border-t border-zinc-200/80">
        <div className="mb-10 sm:mb-14">
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-400 block mb-3">
            {t.teamBadge}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-zinc-900 font-normal leading-[1.15] max-w-4xl text-balance">
            {t.teamTitle}
          </h2>
        </div>

        {/* 3-Column Editorial Grid: Left is Join Hiroki, Center & Right are Team 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-start">
          {/* Column 1: Join Hiroki! Card */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#f8f8f8] border border-zinc-200/80 rounded-2xl p-7 sm:p-9 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 text-zinc-900">
                <Briefcase size={20} />
                <h3 className="font-serif text-2xl text-zinc-900 font-normal">
                  {t.joinCard.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                {t.joinCard.desc}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onOpenContact('Career / Join Hiroki')}
                  className="bg-black text-white px-5 py-3 rounded text-[11px] font-semibold tracking-widest uppercase hover:bg-zinc-800 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>{t.joinCard.button}</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </div>

            {/* Subtle Atelier Note */}
            <div className="hidden lg:block p-6 rounded-2xl border border-zinc-200/60 bg-white space-y-2">
              <span className="text-[10px] tracking-widest uppercase text-zinc-400 font-semibold block">
                {lang === 'en' ? 'HEADQUARTERS' : 'TRỤ SỞ CHÍNH'}
              </span>
              <p className="font-serif text-lg text-zinc-800">
                Tokyo · Minami-Aoyama
              </p>
              <p className="text-xs text-zinc-500">
                {lang === 'en'
                  ? 'Collaborating with partners globally across timezones.'
                  : 'Đồng hành cùng các đối tác toàn cầu xuyên suốt các múi giờ.'}
              </p>
            </div>
          </div>

          {/* Column 2 & 3: 2x2 Grid for 4 Team Members */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {t.teamMembers.map((member) => (
              <div key={member.name} className="flex flex-col space-y-3 group">
                {/* Photo with floating social buttons */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-xs">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103"
                  />

                  {/* Social links capsule at bottom right of image */}
                  <div className="absolute bottom-3 right-3 bg-black/85 backdrop-blur-xs text-zinc-300 px-3 py-1.5 rounded-md flex items-center gap-3 shadow-md">
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                      aria-label="Twitter profile"
                    >
                      <Twitter size={13} />
                    </a>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                      aria-label="Instagram profile"
                    >
                      <Instagram size={13} />
                    </a>
                    <a
                      href="https://pinterest.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                      aria-label="Pinterest profile"
                    >
                      <Pin size={13} />
                    </a>
                  </div>
                </div>

                {/* Name & Role */}
                <div className="flex items-baseline justify-between pt-1">
                  <h4 className="font-serif text-lg text-zinc-900 group-hover:text-zinc-600 transition-colors">
                    {member.name}
                  </h4>
                  <span className="text-[10px] font-medium tracking-wider uppercase text-zinc-400 font-sans">
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
