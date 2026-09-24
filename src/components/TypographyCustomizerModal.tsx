import { useState, useEffect } from 'react';
import { Type, X, Check, RotateCcw, Sliders, Sparkles, Layers } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import {
  CMSTypographySettings,
  DEFAULT_TYPOGRAPHY_SETTINGS,
  AVAILABLE_FONTS,
} from '../services/cmsService';
import { Language } from '../data/content';

interface TypographyCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export function TypographyCustomizerModal({
  isOpen,
  onClose,
  lang = 'vi',
}: TypographyCustomizerModalProps) {
  const isEn = lang === 'en';
  const { siteSettings, saveSiteSettings } = useCMS();

  const [typography, setTypography] = useState<CMSTypographySettings>(() => {
    return siteSettings?.typography || DEFAULT_TYPOGRAPHY_SETTINGS;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state if siteSettings changes externally
  useEffect(() => {
    if (siteSettings?.typography) {
      setTypography(siteSettings.typography);
    }
  }, [siteSettings]);

  if (!isOpen) return null;

  const currentNavFont = typography.unifiedFont
    ? typography.h1FontFamily
    : typography.navFontFamily;

  const handleToggleUnified = () => {
    const nextUnified = !typography.unifiedFont;
    const nextSettings: CMSTypographySettings = {
      ...typography,
      unifiedFont: nextUnified,
      navFontFamily: nextUnified ? typography.h1FontFamily : typography.navFontFamily,
    };
    setTypography(nextSettings);
    // Instant live preview sync
    saveSiteSettings({
      ...siteSettings,
      typography: nextSettings,
    });
  };

  const handleH1FontChange = (fontValue: string) => {
    const nextSettings: CMSTypographySettings = {
      ...typography,
      h1FontFamily: fontValue,
      navFontFamily: typography.unifiedFont ? fontValue : typography.navFontFamily,
    };
    setTypography(nextSettings);
    saveSiteSettings({
      ...siteSettings,
      typography: nextSettings,
    });
  };

  const handleNavFontChange = (fontValue: string) => {
    const nextSettings: CMSTypographySettings = {
      ...typography,
      navFontFamily: fontValue,
    };
    setTypography(nextSettings);
    saveSiteSettings({
      ...siteSettings,
      typography: nextSettings,
    });
  };

  const handleH1SizeChange = (px: number) => {
    const nextSettings: CMSTypographySettings = {
      ...typography,
      h1CustomPx: px,
    };
    setTypography(nextSettings);
    saveSiteSettings({
      ...siteSettings,
      typography: nextSettings,
    });
  };

  const handleNavSizeChange = (px: number) => {
    const nextSettings: CMSTypographySettings = {
      ...typography,
      navFontSizePx: px,
    };
    setTypography(nextSettings);
    saveSiteSettings({
      ...siteSettings,
      typography: nextSettings,
    });
  };

  const handleNavWeightChange = (weight: string) => {
    const nextSettings: CMSTypographySettings = {
      ...typography,
      navFontWeight: weight,
    };
    setTypography(nextSettings);
    saveSiteSettings({
      ...siteSettings,
      typography: nextSettings,
    });
  };

  const handleResetDefaults = async () => {
    setTypography(DEFAULT_TYPOGRAPHY_SETTINGS);
    await saveSiteSettings({
      ...siteSettings,
      typography: DEFAULT_TYPOGRAPHY_SETTINGS,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSave = async () => {
    await saveSiteSettings({
      ...siteSettings,
      typography,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl relative my-6 border border-zinc-200 overflow-hidden text-zinc-900 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Type size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-zinc-900 leading-tight">
                {isEn ? 'Typography & Heading Settings' : 'Tùy chỉnh Phông & Cỡ Chữ (H1 & Nav)'}
              </h2>
              <p className="text-xs text-zinc-500">
                {isEn
                  ? 'Customize font families and font sizes for page H1 headings and navigation'
                  : 'Chỉnh sửa phông chữ & cỡ chữ cho tiêu đề H1 và thanh điều hướng Nav'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-black transition-colors cursor-pointer"
            title={isEn ? 'Close' : 'Đóng'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="space-y-6 py-5 overflow-y-auto pr-1 flex-1">
          {/* Live Preview Box */}
          <div className="bg-zinc-950 rounded-2xl p-5 text-white shadow-inner border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-400 border-b border-zinc-800 pb-2">
              <span className="flex items-center gap-1">
                <Sparkles size={12} className="text-amber-400" />
                <span>{isEn ? 'Live Preview' : 'Xem Trước Trực Tiếp (Live Preview)'}</span>
              </span>
              <span className="text-zinc-500">
                {typography.unifiedFont ? (isEn ? 'Unified Font Active' : 'Đang đồng bộ phông chữ') : (isEn ? 'Separate Fonts' : 'Phông chữ riêng')}
              </span>
            </div>

            {/* Nav Preview */}
            <div className="space-y-1">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                Nav Heading Bar:
              </div>
              <div className="bg-black border border-zinc-800 rounded-lg p-2.5 flex items-center gap-3 overflow-x-auto">
                <nav
                  style={{
                    fontFamily: currentNavFont,
                    fontSize: `${typography.navFontSizePx}px`,
                    fontWeight: typography.navFontWeight || 'medium',
                  }}
                  className="flex items-center gap-4 text-white uppercase tracking-wider"
                >
                  <span className="text-white underline underline-offset-4">Trang chủ</span>
                  <span className="text-zinc-400 hover:text-white cursor-pointer">Dự án</span>
                  <span className="text-zinc-400 hover:text-white cursor-pointer">Dịch vụ</span>
                  <span className="text-zinc-400 hover:text-white cursor-pointer">Bài viết</span>
                  <span className="text-zinc-400 hover:text-white cursor-pointer">Kết nối</span>
                  <span className="bg-white text-black px-2.5 py-1 rounded text-[10px] font-bold">
                    Liên hệ
                  </span>
                </nav>
              </div>
            </div>

            {/* H1 Heading Preview */}
            <div className="space-y-1 pt-2">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                Page Heading (H1):
              </div>
              <h1
                style={{
                  fontFamily: typography.h1FontFamily,
                  fontSize: `clamp(28px, 5vw, ${Math.min(typography.h1CustomPx, 72)}px)`,
                }}
                className="text-white leading-[1.05] tracking-tight font-normal line-clamp-2"
              >
                {isEn ? 'A digital agency from Tokyo.' : 'Một digital agency từ Tokyo.'}
              </h1>
            </div>
          </div>

          {/* Toggle: Unified Font Option */}
          <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/80 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Layers size={16} className="text-zinc-700" />
                <span>
                  {isEn
                    ? 'Use 1 Unified Font for both H1 and Nav'
                    : 'Đồng bộ 1 phông chữ cho cả Heading H1 và Nav'}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                {isEn
                  ? 'When active, both H1 page titles and navigation header will share the exact same font family.'
                  : 'Khi bật, các tiêu đề H1 và thanh điều hướng menu Nav sẽ sử dụng chung 1 kiểu phông chữ.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleUnified}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                typography.unifiedFont ? 'bg-zinc-900' : 'bg-zinc-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                  typography.unifiedFont ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Section 1: H1 Heading Font Family & Font Size */}
          <div className="space-y-4 pt-2 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                <Type size={16} className="text-zinc-900" />
                <span>{isEn ? '1. Heading H1 Font Family & Size' : '1. Phông Chữ & Cỡ Chữ Heading H1'}</span>
              </h3>
              <span className="text-xs font-mono font-bold bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                {typography.h1CustomPx}px
              </span>
            </div>

            {/* Font Selector Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AVAILABLE_FONTS.map((f) => {
                const isSelected = typography.h1FontFamily === f.value;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleH1FontChange(f.value)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-zinc-900 bg-zinc-900 text-white shadow-md ring-2 ring-zinc-900/20'
                        : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-800 hover:bg-zinc-50'
                    }`}
                  >
                    <div>
                      <div
                        style={{ fontFamily: f.value }}
                        className="text-xl sm:text-2xl leading-tight mb-1 truncate font-normal"
                      >
                        Aa
                      </div>
                      <div className="text-xs font-semibold truncate">{f.name}</div>
                    </div>
                    <div
                      className={`text-[9px] mt-2 truncate ${
                        isSelected ? 'text-zinc-300' : 'text-zinc-400'
                      }`}
                    >
                      {f.category}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* H1 Size Slider & Quick Presets */}
            <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
                <span>{isEn ? 'H1 Font Size Slider (32px - 120px):' : 'Cỡ Chữ Heading H1 (32px - 120px):'}</span>
                <span className="text-zinc-900 font-mono font-bold">{typography.h1CustomPx}px</span>
              </div>

              <input
                type="range"
                min={32}
                max={120}
                step={2}
                value={typography.h1CustomPx}
                onChange={(e) => handleH1SizeChange(Number(e.target.value))}
                className="w-full accent-zinc-900 cursor-pointer"
              />

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-zinc-500 mr-1">{isEn ? 'Presets:' : 'Cỡ nhanh:'}</span>
                {[48, 64, 80, 96, 112].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleH1SizeChange(sz)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                      typography.h1CustomPx === sz
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {sz}px
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Nav Menu Font Family, Size & Weight */}
          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                <Sliders size={16} className="text-zinc-900" />
                <span>{isEn ? '2. Navigation Bar Font Family & Size' : '2. Phông Chữ & Cỡ Chữ Nav Header'}</span>
              </h3>
              <span className="text-xs font-mono font-bold bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                {typography.navFontSizePx}px / {typography.navFontWeight || 'medium'}
              </span>
            </div>

            {/* Nav Font Selector (Only active if unified is FALSE) */}
            {!typography.unifiedFont ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {AVAILABLE_FONTS.map((f) => {
                  const isSelected = typography.navFontFamily === f.value;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleNavFontChange(f.value)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-md ring-2 ring-zinc-900/20'
                          : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-800 hover:bg-zinc-50'
                      }`}
                    >
                      <div>
                        <div
                          style={{ fontFamily: f.value }}
                          className="text-base sm:text-lg leading-tight mb-1 truncate font-normal uppercase"
                        >
                          MENU
                        </div>
                        <div className="text-xs font-semibold truncate">{f.name}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 flex items-center gap-2">
                <Check size={16} className="text-amber-600 shrink-0" />
                <span>
                  {isEn
                    ? 'Nav font is synced with H1 font because Unified Font Mode is enabled above.'
                    : 'Phông chữ Nav đang được đồng bộ tự động theo phông chữ H1 do tùy chọn Đồng bộ đang bật.'}
                </span>
              </div>
            )}

            {/* Nav Size & Weight Control */}
            <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/80 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
                  <span>{isEn ? 'Nav Font Size (10px - 20px):' : 'Cỡ Chữ Nav Header (10px - 20px):'}</span>
                  <span className="text-zinc-900 font-mono font-bold">{typography.navFontSizePx}px</span>
                </div>

                <input
                  type="range"
                  min={10}
                  max={20}
                  step={1}
                  value={typography.navFontSizePx}
                  onChange={(e) => handleNavSizeChange(Number(e.target.value))}
                  className="w-full accent-zinc-900 cursor-pointer"
                />

                {/* Nav Size Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-zinc-500 mr-1">{isEn ? 'Presets:' : 'Cỡ nhanh:'}</span>
                  {[10, 11, 12, 13, 14, 15, 16].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleNavSizeChange(sz)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        typography.navFontSizePx === sz
                          ? 'bg-zinc-900 text-white shadow-xs'
                          : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {sz}px
                    </button>
                  ))}
                </div>
              </div>

              {/* Nav Weight Selector */}
              <div className="pt-2 border-t border-zinc-200/60">
                <label className="block text-xs font-semibold text-zinc-700 mb-2">
                  {isEn ? 'Nav Font Weight:' : 'Độ Đậm Chữ Nav (Font Weight):'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'normal', label: isEn ? 'Normal (400)' : 'Thường (400)' },
                    { key: 'medium', label: isEn ? 'Medium (500)' : 'Vừa (500)' },
                    { key: 'semibold', label: isEn ? 'Semibold (600)' : 'Nổi bật (600)' },
                    { key: 'bold', label: isEn ? 'Bold (700)' : 'Đậm (700)' },
                  ].map((w) => (
                    <button
                      key={w.key}
                      type="button"
                      onClick={() => handleNavWeightChange(w.key)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                        typography.navFontWeight === w.key
                          ? 'bg-zinc-900 text-white shadow-xs'
                          : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 hover:border-zinc-400 text-zinc-700 hover:bg-zinc-50 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>{isEn ? 'Reset to Defaults' : 'Đặt Lại Mặc Định'}</span>
          </button>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <Check size={14} />
                <span>{isEn ? 'Saved!' : 'Đã lưu cấu hình!'}</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>{isEn ? 'Apply & Save' : 'Áp Dụng & Lưu'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
