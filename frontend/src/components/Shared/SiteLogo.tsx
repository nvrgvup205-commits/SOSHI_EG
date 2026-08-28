import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';
import { useLanguage } from '../../hooks/useLanguage';

interface Props {
  to?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  surface?: 'dark' | 'light';
  showName?: boolean;
}

export default function SiteLogo({ to = '/', size = 'sm', className = '', surface, showName = false }: Props) {
  const { lang } = useLanguage();
  const name = lang === 'ar' ? 'سوشي شوب مصر' : 'SUSHI SHOP EGYPT';

  const mark = (
    <span className={`flex items-center gap-2 ${className}`}>
      <BrandMark size={size} surface={surface} />
      {showName && (
        <span className="hidden sm:block font-display text-[10px] sm:text-xs uppercase tracking-wider text-fg leading-tight max-w-[7rem]">
          {name}
        </span>
      )}
    </span>
  );

  if (!to) return mark;
  return (
    <Link to={to} className="block shrink-0" aria-label="Sushi Shop Egypt">
      {mark}
    </Link>
  );
}
