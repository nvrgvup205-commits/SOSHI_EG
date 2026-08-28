import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';

interface Props {
  to?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  surface?: 'dark' | 'light';
  showName?: boolean;
}

export default function SiteLogo({ to = '/', size = 'sm', className = '', surface, showName = false }: Props) {
  const mark = (
    <span className={`flex items-center gap-2 min-w-0 ${className}`}>
      <BrandMark size={size} surface={surface} />
      {showName && (
        <span className="flex flex-col leading-[1.05] text-end">
          <span className="font-display text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-fg">
            Sushi Shop
          </span>
          <span className="font-display text-[11px] sm:text-xs uppercase tracking-[0.22em] text-accent">
            Egypt
          </span>
        </span>
      )}
    </span>
  );

  if (!to) return mark;
  return (
    <Link to={to} className="block shrink-0" aria-label="SUSHI SHOP EGYPT">
      {mark}
    </Link>
  );
}
