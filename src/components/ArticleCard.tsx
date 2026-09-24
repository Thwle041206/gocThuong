import { useState } from 'react';
import { Article, Language, UI_TEXT } from '../data/content';
import { ArrowUpRight } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { getBadgeColorClasses } from '../services/cmsService';

interface ArticleCardProps {
  article: Article;
  lang: Language;
  onRead: (article: Article) => void;
  priorityOverlay?: boolean;
}

export function ArticleCard({
  article,
  lang,
  onRead,
  priorityOverlay = false
}: ArticleCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { editorialTags } = useCMS();
  const t = UI_TEXT[lang];

  // Find matching badge config from CMS
  const matchingTag = editorialTags?.find(
    (tag) => tag.name.toUpperCase() === (article.tag || '').toUpperCase()
  );
  const badgeColorClass = getBadgeColorClasses(matchingTag?.color || 'dark');

  return (
    <article
      onClick={() => onRead(article)}
      className="group cursor-pointer flex flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900 rounded-2xl"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onRead(article);
        }
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200/50 shadow-xs">
        {/* Fallback styling if image fails */}
        {imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white p-6 text-center">
            <span className="font-serif text-xl mb-1">{article.title[lang]}</span>
            <span className="text-xs text-zinc-400">{article.tag}</span>
          </div>
        ) : (
          <img
            src={article.image}
            alt={article.title[lang]}
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Top-Right Badge with dynamic CMS style */}
        <div className="absolute top-4 right-4 z-10">
          <span className={`text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded select-none ${badgeColorClass}`}>
            {article.tag}
          </span>
        </div>

        {/* Bottom "READ ARTICLE" bar as seen in first card of screenshot */}
        <div
          className={`absolute inset-x-3 bottom-3 z-10 transition-all duration-300 ${
            priorityOverlay
              ? 'opacity-95 translate-y-0'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
          }`}
        >
          <div className="w-full bg-black/90 backdrop-blur-xs text-white text-center py-2.5 px-4 rounded-lg text-[11px] font-medium tracking-[0.16em] uppercase flex items-center justify-center gap-1.5 shadow-lg group-hover:bg-black transition-colors">
            <span>{t.card.readArticle}</span>
            <ArrowUpRight size={13} className="text-zinc-300" />
          </div>
        </div>
      </div>

      {/* Article Content Below Image */}
      <div className="pt-4 sm:pt-5 pb-2 flex flex-col flex-1">
        {/* Title in Serif font matching screenshot */}
        <h2 className="font-serif text-xl sm:text-2xl font-normal leading-[1.3] text-zinc-900 group-hover:text-zinc-600 transition-colors text-balance">
          {article.title[lang]}
        </h2>

        {/* Subtitle / Excerpt in muted sans font matching screenshot */}
        <p className="mt-2 text-sm sm:text-[15px] text-zinc-500 font-sans leading-relaxed line-clamp-2">
          {article.excerpt[lang]}
        </p>

        {/* Unboxed Metadata (Anti-slop clean typographic footer) */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400 font-sans flex-wrap">
          <span className="text-zinc-600 font-medium">{article.author.name}</span>
          <span aria-hidden="true" className="text-zinc-300">·</span>
          <span>{article.date}</span>
          {article.publishTime && (
            <>
              <span aria-hidden="true" className="text-zinc-300">•</span>
              <span className="font-mono text-[11px] text-zinc-500">{article.publishTime}</span>
            </>
          )}
          <span aria-hidden="true" className="text-zinc-300">·</span>
          <span>{article.readTime}</span>
        </div>
      </div>
    </article>
  );
}

