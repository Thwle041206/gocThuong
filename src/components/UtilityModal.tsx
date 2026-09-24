import { X } from 'lucide-react';
import { Language } from '../data/content';

interface UtilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  lang: Language;
}

export function UtilityModal({
  isOpen,
  onClose,
  title,
  description,
  lang
}: UtilityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white text-zinc-900 rounded-3xl p-7 sm:p-9 shadow-2xl border border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors text-zinc-600 hover:text-black cursor-pointer"
        >
          <X size={16} />
        </button>

        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 block mb-1">
          {lang === 'en' ? 'System Information' : 'Thông tin hệ thống'}
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl text-zinc-900 font-normal mb-3">
          {title}
        </h3>
        <p className="text-zinc-600 text-sm leading-relaxed mb-6 font-sans">
          {description}
        </p>

        <button
          onClick={onClose}
          className="w-full bg-black text-white py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
        >
          {lang === 'en' ? 'Got It' : 'Đã Hiểu'}
        </button>
      </div>
    </div>
  );
}
