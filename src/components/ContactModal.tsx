import { useState } from 'react';
import { X, Send, CheckCircle2, Mail, MapPin } from 'lucide-react';
import { Language, UI_TEXT } from '../data/content';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  defaultService?: string;
}

export function ContactModal({ isOpen, onClose, lang, defaultService }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: defaultService || 'Brand Identity & Strategy',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const t = UI_TEXT[lang].contactModal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setFormData({ name: '', email: '', service: 'Brand Identity & Strategy', message: '' });
      }, 2500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white text-zinc-900 rounded-3xl p-7 sm:p-10 shadow-2xl border border-zinc-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors text-zinc-600 hover:text-black cursor-pointer"
        >
          <X size={18} />
        </button>

        {isSuccess ? (
          <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-serif text-3xl text-zinc-900 font-normal">
              {t.successTitle}
            </h3>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
              {t.successDesc}
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-semibold tracking-widest uppercase text-zinc-400 block mb-1">
                {t.badge}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-900">
                {t.title}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-zinc-500 leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t.namePlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t.emailPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  {t.serviceLabel}
                </label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-white"
                >
                  {t.serviceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                  {t.messageLabel}
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t.messagePlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-3 px-6 rounded-xl text-xs font-semibold uppercase tracking-widest hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{isSubmitting ? t.sendingBtn : t.submitBtn}</span>
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                <Mail size={13} className="text-zinc-400" />
                <a href="mailto:hello@hiroki.studio" className="hover:text-black font-medium">
                  hello@hiroki.studio
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-zinc-400" />
                <span>{t.location}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
