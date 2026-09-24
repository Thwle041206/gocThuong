interface LogoIpsumProps {
  variant?: 1 | 2 | 3 | 4 | 5;
  className?: string;
  theme?: 'dark' | 'light';
}

export function LogoIpsum({ variant = 1, className = '', theme = 'light' }: LogoIpsumProps) {
  const isLight = theme === 'light';
  const textColor = isLight ? 'text-zinc-900' : 'text-white';
  const iconColor = isLight ? '#18181b' : '#ffffff';

  return (
    <div className={`flex items-center gap-2.5 select-none ${textColor} ${className}`}>
      {/* Variant Icon */}
      {variant === 1 && (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill={iconColor} />
          <circle cx="12" cy="12" r="2.5" fill={isLight ? '#ffffff' : '#000000'} />
        </svg>
      )}

      {variant === 2 && (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" rx="1.5" fill={iconColor} />
          <rect x="14" y="3" width="7" height="7" rx="1.5" fill={iconColor} fillOpacity="0.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" fill={iconColor} fillOpacity="0.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" fill={iconColor} />
        </svg>
      )}

      {variant === 3 && (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="12" r="5" stroke={iconColor} strokeWidth="2.5" />
          <circle cx="16" cy="12" r="5" stroke={iconColor} strokeWidth="2.5" />
        </svg>
      )}

      {variant === 4 && (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 19V5M9 19V5M14 19V5M19 19V5" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M2 19H21" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      )}

      {variant === 5 && (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke={iconColor} strokeWidth="2.2" />
          <circle cx="12" cy="12" r="4" fill={iconColor} />
        </svg>
      )}

      {/* Brand Text */}
      <span className="font-sans font-extrabold tracking-tight text-base sm:text-lg lowercase leading-none">
        logoipsum<span className="text-zinc-400">’</span>
      </span>
    </div>
  );
}
