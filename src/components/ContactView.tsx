import { useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Language, UI_TEXT } from '../data/content';
import { useCMS } from '../context/CMSContext';
import { DEFAULT_TYPOGRAPHY_SETTINGS } from '../services/cmsService';

interface ContactViewProps {
  lang: Language;
}

export function ContactView({ lang }: ContactViewProps) {
  const { siteSettings } = useCMS();
  const typography = siteSettings?.typography || DEFAULT_TYPOGRAPHY_SETTINGS;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const t = UI_TEXT[lang].contactPage;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 700);
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '' });
    setIsSuccess(false);
  };

  return (
    <div className="animate-in fade-in duration-300 pb-28 sm:pb-36">
      {/* 1. CONTACT HEADING & SUBTITLE */}
      <section className="px-6 sm:px-10 pt-12 sm:pt-16 pb-6 text-center max-w-3xl mx-auto">
        <h1
          style={{
            fontFamily: typography.h1FontFamily,
            fontSize: typography.h1CustomPx ? `clamp(32px, 6vw, ${typography.h1CustomPx}px)` : undefined,
          }}
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[76px] text-zinc-900 font-normal leading-[1.05] tracking-tight"
        >
          {t.title}
        </h1>
        <p className="mt-4 sm:mt-5 text-zinc-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed font-sans whitespace-pre-line text-balance">
          {t.subtitle}
        </p>
      </section>

      {/* 2. MINIMALIST CONTACT FORM MATCHING SCREENSHOT */}
      <section className="px-6 max-w-2xl mx-auto pt-6 sm:pt-8">
        {isSuccess ? (
          <div className="bg-[#f9f9f9] border border-zinc-200/80 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center space-y-4 animate-in zoom-in-95 duration-200 shadow-2xs">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={30} />
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-zinc-900 font-normal">
              {t.successTitle}
            </h3>
            <p className="text-zinc-600 text-sm max-w-md mx-auto leading-relaxed">
              {t.successSubtitle}
            </p>
            <div className="pt-4">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-black hover:text-zinc-600 transition-colors pb-1 border-b border-black cursor-pointer"
              >
                <span>{t.sendAnother}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Top row: 2 input fields side-by-side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="sr-only">
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t.namePlaceholder}
                  className="w-full rounded-xl sm:rounded-2xl border border-zinc-200/90 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-zinc-900 transition-colors shadow-2xs"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="sr-only">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t.emailPlaceholder}
                  className="w-full rounded-xl sm:rounded-2xl border border-zinc-200/90 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-zinc-900 transition-colors shadow-2xs"
                />
              </div>
            </div>

            {/* Message Textarea */}
            <div>
              <label htmlFor="contact-message" className="sr-only">
                Message
              </label>
              <textarea
                id="contact-message"
                required
                rows={7}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={t.messagePlaceholder}
                className="w-full rounded-xl sm:rounded-2xl border border-zinc-200/90 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-zinc-900 transition-colors shadow-2xs resize-y min-h-[170px]"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black hover:bg-zinc-800 disabled:bg-zinc-700 text-white font-medium text-xs tracking-[0.14em] uppercase py-3.5 sm:py-4 rounded-md sm:rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                {isSubmitting ? t.sendingBtn : t.sendBtn}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
