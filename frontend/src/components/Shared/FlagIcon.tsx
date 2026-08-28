import type { Language } from '../../types';

interface Props {
  lang: Language;
  className?: string;
}

export default function FlagIcon({ lang, className = 'w-6 h-6' }: Props) {
  const base = `${className} rounded-full overflow-hidden shrink-0`;

  if (lang === 'ar') {
    return (
      <svg viewBox="0 0 32 32" className={base} aria-hidden>
        <rect width="32" height="10.67" y="0" fill="#CE1126" />
        <rect width="32" height="10.67" y="10.67" fill="#FFFFFF" />
        <rect width="32" height="10.66" y="21.34" fill="#000000" />
        <circle cx="16" cy="16" r="4" fill="#C09300" opacity="0.85" />
      </svg>
    );
  }

  if (lang === 'ru') {
    return (
      <svg viewBox="0 0 32 32" className={base} aria-hidden>
        <rect width="32" height="10.67" y="0" fill="#FFFFFF" />
        <rect width="32" height="10.67" y="10.67" fill="#0039A6" />
        <rect width="32" height="10.66" y="21.34" fill="#D52B1E" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" className={base} aria-hidden>
      <rect width="32" height="32" fill="#012169" />
      <path d="M0 0 L32 32 M32 0 L0 32" stroke="#FFFFFF" strokeWidth="5" />
      <path d="M0 0 L32 32 M32 0 L0 32" stroke="#C8102E" strokeWidth="2.5" />
      <path d="M16 0 V32 M0 16 H32" stroke="#FFFFFF" strokeWidth="8" />
      <path d="M16 0 V32 M0 16 H32" stroke="#C8102E" strokeWidth="4.5" />
    </svg>
  );
}
