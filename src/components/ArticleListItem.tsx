import { useState } from 'react';
import { Article, Language, UI_TEXT } from '../data/content';
import { ArrowUpRight, Clock } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { getBadgeColorClasses } from '../services/cmsService';

interface ArticleListItemProps {
  article: Article;
  lang: Language;
  onRead: (article: Article) => void;
}

export function ArticleListItem({
  article,
  lang,
  onRead,
}: ArticleListItemProps) {
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
      className="group cursor-pointer bg-white hover:bg-zinc-50/80 border border-zinc-200/80 hover:border-zinc-300 rounded-2xl p-4 sm:p-5 transition-all duration-300 shadow-2xs hover:shadow-sm flex flex-col md:flex-row items-start md:items-center gap-5 sm:gap-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-900"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onRead(article);
        }
      }}
    >
      {/* Thumbnail */}
      <div className="relative w-full md:w-64 lg:w-72 aspect-[16/10] md:aspect-[16/11] shrink-0 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200/60">
        {imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white p-4 text-center">
            <span className="font-serif text-sm mb-1 line-clamp-1">{article.title[lang]}</span>
            <span className="text-[10px] text-zinc-400">{article.tag}</span>
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

        {/* Badge in top corner */}
        <div className="absolute top-2.5 right-2.5 z-10 md:hidden">
          <span className={`text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded shadow-xs ${badgeColorClass}`}>
            {article.tag}
          </span>
        </div>
      </div>

      {/* Info & Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1 space-y-3 w-full">
        <div className="space-y-2">
          {/* Category & Badge Row */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className={`hidden md:inline-flex text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded shadow-2xs ${badgeColorClass}`}>
              {article.tag}
            </span>
            {article.category && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                {article.category}
              </span>
            )}
            <span className="text-zinc-300 hidden md:inline">·</span>
            <span className="text-xs text-zinc-400">{article.date}</span>
            {article.publishTime && (
              <>
                <span className="text-zinc-300">•</span>
                <span className="font-mono text-[11px] text-zinc-500">{article.publishTime}</span>
              </>
            )}
          </div>

          {/* Title in Serif font */}
          <h2 className="font-serif text-xl sm:text-2xl font-normal leading-[1.3] text-zinc-900 group-hover:text-zinc-600 transition-colors text-balance line-clamp-2">
            {article.title[lang]}
          </h2>

          {/* Excerpt */}
          <p className="text-sm sm:text-[15px] text-zinc-500 font-sans leading-relaxed line-clamp-2">
            {article.excerpt[lang]}
          </p>
        </div>

        {/* Bottom row: Author & Read CTA button */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="font-medium text-zinc-700">{article.author.name}</span>
            <span className="text-zinc-300">·</span>
            <span className="flex items-center gap-1 text-zinc-400">
              <Clock size={12} />
              <span>{article.readTime}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-900 group-hover:text-black group-hover:translate-x-0.5 transition-transform">
            <span>{t.card.readArticle}</span>
            <ArrowUpRight size={14} className="text-zinc-600 group-hover:text-black transition-colors" />
          </div>
        </div>
      </div>
    </article>
  );
}
