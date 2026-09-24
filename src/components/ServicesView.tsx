import { Language, SERVICES } from '../data/content';
import { ArrowRight, Check } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { DEFAULT_TYPOGRAPHY_SETTINGS } from '../services/cmsService';

interface ServicesViewProps {
  lang: Language;
  onOpenContact: () => void;
}

export function ServicesView({ lang, onOpenContact }: ServicesViewProps) {
  const isEn = lang === 'en';
  const { siteSettings, publishedServices } = useCMS();
  const typography = siteSettings?.typography || DEFAULT_TYPOGRAPHY_SETTINGS;

  const activeServices = (publishedServices && publishedServices.length > 0)
    ? publishedServices
    : SERVICES;

  const title = isEn
    ? siteSettings?.services?.title_en || 'Design Services'
    : siteSettings?.services?.title_vi || 'Dịch Vụ Thiết Kế';

  const subtitle = isEn
    ? siteSettings?.services?.subtitle_en || 'Strategic partnership models tailored for emerging leaders, technology ventures, and premium cultural brands.'
    : siteSettings?.services?.subtitle_vi || 'Mô hình hợp tác chiến lược được may đo cho các thương hiệu dẫn đầu, công nghệ và văn hóa cao cấp.';

  return (
    <section className="max-w-6xl mx-auto px-6 py-12 animate-in fade-in duration-300">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-zinc-400 block mb-2">
          {lang === 'en' ? 'CAPABILITIES & OFFERINGS' : 'NĂNG LỰC & DỊCH VỤ'}
        </span>
        <h1
          style={{
            fontFamily: typography.h1FontFamily,
            fontSize: typography.h1CustomPx ? `clamp(32px, 6vw, ${typography.h1CustomPx}px)` : undefined,
          }}
          className="font-serif text-5xl sm:text-6xl text-zinc-900 font-normal leading-tight"
        >
          {title}
        </h1>
        <p className="mt-3 text-zinc-500 text-sm sm:text-base max-w-lg mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {activeServices.map((srv) => {
          const srvTitle = srv.title?.[lang] || (typeof srv.title === 'string' ? srv.title : '');
          const srvDesc = srv.description?.[lang] || (typeof srv.description === 'string' ? srv.description : '');
          const srvFeatures = srv.features?.[lang] || (Array.isArray(srv.features) ? srv.features : []);
          const btnLabel = srv.linkText?.[lang] || (lang === 'en' ? 'Start Collaboration' : 'Bắt đầu hợp tác');

          return (
            <div
              key={srv.id}
              className="rounded-3xl border border-zinc-200 p-8 sm:p-10 flex flex-col justify-between hover:border-black transition-all bg-white hover:shadow-lg"
            >
              <div>
                <span className="font-serif text-3xl text-zinc-400 block mb-6 font-light">
                  {srv.number}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-zinc-900 font-normal mb-4">
                  {srvTitle}
                </h2>
                <p className="text-zinc-600 text-sm leading-relaxed mb-8">
                  {srvDesc}
                </p>

                {srvFeatures && srvFeatures.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-zinc-100">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                      {lang === 'en' ? 'Core Capabilities' : 'Năng lực cốt lõi'}
                    </span>
                    {srvFeatures.map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-700">
                        <Check size={14} className="text-zinc-900 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-10">
                <button
                  onClick={onOpenContact}
                  className="w-full py-3 px-4 rounded-xl border border-zinc-300 text-xs font-semibold uppercase tracking-widest text-zinc-900 hover:bg-black hover:text-white hover:border-black transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{btnLabel}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
