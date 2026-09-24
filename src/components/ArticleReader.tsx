import { useState, useEffect } from 'react';
import { Article, Language, UI_TEXT, ARTICLES, getArticleBlocks, ArticleContentBlock } from '../data/content';
import { ArrowLeft, Check, Copy, Share2, ArrowRight, Clock, Quote } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { DEFAULT_TYPOGRAPHY_SETTINGS } from '../services/cmsService';

interface ArticleReaderProps {
  article: Article;
  lang: Language;
  onBack: () => void;
  onSelectArticle: (article: Article) => void;
  onToggleLang: () => void;
}

export function ArticleReader({
  article,
  lang,
  onBack,
  onSelectArticle,
  onToggleLang
}: ArticleReaderProps) {
  const [copied, setCopied] = useState(false);
  const t = UI_TEXT[lang];
  const articleContent = article.content[lang];
  const { siteSettings } = useCMS();
  const typography = siteSettings?.typography || DEFAULT_TYPOGRAPHY_SETTINGS;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article.id]);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Find next article
  const currentIndex = ARTICLES.findIndex((a) => a.id === article.id);
  const nextArticle = ARTICLES[(currentIndex + 1) % ARTICLES.length];

  return (
    <article className="max-w-4xl mx-auto px-6 py-8 sm:py-12 animate-in fade-in duration-300">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-black transition-colors group cursor-pointer"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          <span>{t.reader.back}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleLang}
            className="text-xs font-semibold border border-zinc-300 px-3 py-1 rounded-md hover:bg-zinc-100 transition-colors"
          >
            {lang === 'en' ? 'Đọc bằng Tiếng Việt' : 'Read in English'}
          </button>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-zinc-100 text-zinc-800 px-3 py-1 rounded-md hover:bg-zinc-200 transition-colors"
            title="Share article"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? t.reader.copied : t.reader.share}</span>
          </button>
        </div>
      </div>

      {/* Article Header */}
      <header className="mb-10 text-center">
        {/* Category & Metadata */}
        <div className="flex items-center justify-center gap-2 text-xs font-medium tracking-widest uppercase text-zinc-500 mb-4">
          <span className="text-black font-semibold">{article.category}</span>
          <span aria-hidden="true">·</span>
          <span>{article.tag}</span>
          <span aria-hidden="true">·</span>
          <span>{article.readTime}</span>
        </div>

        {/* Big Serif Headline */}
        <h1
          style={{
            fontFamily: typography.h1FontFamily,
            fontSize: typography.h1CustomPx ? `clamp(28px, 5vw, ${Math.min(typography.h1CustomPx, 64)}px)` : undefined,
          }}
          className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal leading-[1.15] text-zinc-900 max-w-3xl mx-auto text-balance"
        >
          {article.title[lang]}
        </h1>

        {/* Author Details */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <img
            src={article.author.avatar}
            alt={article.author.name}
            className="w-11 h-11 rounded-full object-cover border border-zinc-300 shadow-xs"
          />
          <div className="text-left">
            <p className="text-sm font-semibold text-zinc-900 leading-tight">{article.author.name}</p>
            <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>{article.author.role[lang]}</span>
              <span aria-hidden="true" className="text-zinc-300">·</span>
              <span className="text-zinc-700 font-medium">{article.date}</span>
              {article.publishTime && (
                <>
                  <span aria-hidden="true" className="text-zinc-300">•</span>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                    <Clock size={11} className="text-zinc-500" />
                    <span>{article.publishTime}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-12 shadow-sm border border-zinc-200">
        <img
          src={article.image}
          alt={article.title[lang]}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Article Body */}
      <div className="max-w-3xl mx-auto text-zinc-800 font-sans space-y-10 text-base sm:text-lg leading-relaxed">
        {getArticleBlocks(article).map((block, bIdx) => {
          const blockTitle = block.title?.[lang] || block.title?.vi || block.title?.en;
          const blockBody = block.body?.[lang] || block.body?.vi || block.body?.en;
          const blockQuote = block.quote?.[lang] || block.quote?.vi || block.quote?.en;
          const blockCaption = block.imageCaption?.[lang] || block.imageCaption?.vi || block.imageCaption?.en;
          const hasImage = !!block.image;
          const hasSecondaryImage = !!block.secondaryImage;
          const pos = block.imagePosition || (hasImage ? 'below' : 'none');
          const layout = block.layoutMode || 'stacked';

          const renderMedia = () => {
            if (!hasImage && !hasSecondaryImage) return null;

            if (hasImage && hasSecondaryImage) {
              return (
                <div className="my-4 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl overflow-hidden border border-zinc-200 aspect-[4/3] bg-zinc-100 shadow-xs">
                      <img src={block.image} alt={blockTitle || 'Media 1'} className="w-full h-full object-cover" />
                    </div>
                    <div className="rounded-xl overflow-hidden border border-zinc-200 aspect-[4/3] bg-zinc-100 shadow-xs">
                      <img src={block.secondaryImage} alt={blockTitle || 'Media 2'} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  {blockCaption && (
                    <p className="text-xs text-zinc-500 font-sans italic text-center">{blockCaption}</p>
                  )}
                </div>
              );
            }

            return (
              <div className="my-4 space-y-2">
                <div className="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-xs max-h-[460px]">
                  <img src={block.image} alt={blockTitle || 'Media'} className="w-full h-full object-cover" />
                </div>
                {blockCaption && (
                  <p className="text-xs text-zinc-500 font-sans italic text-center">{blockCaption}</p>
                )}
              </div>
            );
          };

          if (block.type === 'intro') {
            return (
              <div key={block.id || bIdx} className="space-y-4">
                {pos === 'banner' && renderMedia()}
                {pos === 'left' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>{renderMedia()}</div>
                    <p className="font-serif text-xl sm:text-2xl leading-relaxed text-zinc-800 italic border-l-2 border-black pl-5">
                      {blockBody}
                    </p>
                  </div>
                ) : pos === 'right' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <p className="font-serif text-xl sm:text-2xl leading-relaxed text-zinc-800 italic border-l-2 border-black pl-5">
                      {blockBody}
                    </p>
                    <div>{renderMedia()}</div>
                  </div>
                ) : (
                  <>
                    <p className="font-serif text-xl sm:text-2xl leading-relaxed text-zinc-800 italic border-l-2 border-black pl-5">
                      {blockBody}
                    </p>
                    {pos === 'below' && renderMedia()}
                  </>
                )}
              </div>
            );
          }

          if (block.type === 'keyPoints') {
            const items = block.items || [];
            return (
              <div
                key={block.id || bIdx}
                className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-6 sm:p-7 shadow-xs"
              >
                <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-900 mb-4">
                  {blockTitle || t.reader.takeaways}
                </h2>
                {layout === 'grid-2' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm text-zinc-700">
                    {items.map((it, idx) => (
                      <div key={idx} className="bg-white p-3.5 rounded-xl border border-zinc-200/90 flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-2 shrink-0" />
                        <span className="leading-snug">{it[lang] || it.vi || it.en}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-2.5 text-sm sm:text-base text-zinc-700">
                    {items.map((it, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 mt-2 shrink-0" />
                        <span>{it[lang] || it.vi || it.en}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {pos === 'below' && renderMedia()}
              </div>
            );
          }

          if (block.type === 'quote') {
            return (
              <div key={block.id || bIdx} className="my-10">
                <blockquote className="py-6 border-y border-zinc-200 text-center relative">
                  <p className="font-serif text-2xl sm:text-3xl italic text-zinc-900 leading-snug">
                    "{blockQuote}"
                  </p>
                  {block.quoteAuthor && (
                    <cite className="block mt-3 text-xs tracking-wider uppercase text-zinc-500 not-italic font-sans">
                      — {block.quoteAuthor}
                    </cite>
                  )}
                </blockquote>
                {pos === 'below' && renderMedia()}
              </div>
            );
          }

          if (block.type === 'image') {
            return (
              <div key={block.id || bIdx} className="my-6">
                {renderMedia()}
              </div>
            );
          }

          if (block.type === 'conclusion') {
            return (
              <div key={block.id || bIdx} className="pt-6 border-t border-zinc-200 space-y-4">
                {blockTitle && (
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    {blockTitle}
                  </h3>
                )}
                <p className="text-zinc-800 leading-relaxed font-medium">
                  {blockBody}
                </p>
                {renderMedia()}
              </div>
            );
          }

          // Default: Section block with flexible image placement and grid layout
          const isCard = layout === 'card';
          const isSplitLeft = pos === 'left' || layout === 'split-left';
          const isSplitRight = pos === 'right' || layout === 'split-right';

          return (
            <div
              key={block.id || bIdx}
              className={`space-y-4 ${
                isCard
                  ? 'bg-zinc-50 border border-zinc-200 rounded-2xl p-6 sm:p-8'
                  : 'pt-2'
              }`}
            >
              {pos === 'banner' && renderMedia()}

              {isSplitLeft ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="order-2 md:order-1">{renderMedia()}</div>
                  <div className="order-1 md:order-2 space-y-3">
                    {blockTitle && (
                      <h2 className="font-serif text-2xl sm:text-3xl text-zinc-900 font-normal">
                        {blockTitle}
                      </h2>
                    )}
                    <p className="text-zinc-600 leading-relaxed font-sans">{blockBody}</p>
                  </div>
                </div>
              ) : isSplitRight ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-3">
                    {blockTitle && (
                      <h2 className="font-serif text-2xl sm:text-3xl text-zinc-900 font-normal">
                        {blockTitle}
                      </h2>
                    )}
                    <p className="text-zinc-600 leading-relaxed font-sans">{blockBody}</p>
                  </div>
                  <div>{renderMedia()}</div>
                </div>
              ) : (
                <>
                  {blockTitle && (
                    <h2 className="font-serif text-2xl sm:text-3xl text-zinc-900 font-normal">
                      {blockTitle}
                    </h2>
                  )}
                  <p className="text-zinc-600 leading-relaxed font-sans whitespace-pre-line">{blockBody}</p>
                  {(pos === 'below' || (hasImage && pos !== 'banner')) && renderMedia()}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Next Article Card Navigation */}
      <div className="mt-16 pt-10 border-t border-zinc-200 max-w-2xl mx-auto">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 block mb-3">
          {t.reader.nextArticle}
        </span>
        <div
          onClick={() => onSelectArticle(nextArticle)}
          className="group cursor-pointer p-6 rounded-2xl border border-zinc-200 hover:border-black transition-all bg-white hover:shadow-md flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <span className="text-xs uppercase font-medium text-zinc-500">
              {nextArticle.category} · {nextArticle.readTime}
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-zinc-900 group-hover:text-zinc-600 transition-colors">
              {nextArticle.title[lang]}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-100 group-hover:bg-black group-hover:text-white transition-colors flex items-center justify-center shrink-0">
            <ArrowRight size={18} />
          </div>
        </div>
      </div>
    </article>
  );
}
