import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';

interface Props {
  to?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function SiteLogo({ to = '/', size = 'sm', className = '' }: Props) {
  const mark = <BrandMark size={size} className={className} />;
  if (!to) return mark;
  return (
    <Link to={to} className="block shrink-0" aria-label="Sushi Shop Egypt">
      {mark}
    </Link>
  );
}
