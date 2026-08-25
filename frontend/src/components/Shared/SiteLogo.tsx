import { Link } from 'react-router-dom';
import AnimatedLogo from './AnimatedLogo';

interface Props {
  to?: string;
  size?: 'hero' | 'md' | 'sm';
  className?: string;
}

export default function SiteLogo({ to = '/', size = 'sm', className = '' }: Props) {
  const logo = <AnimatedLogo size={size} className={className} />;

  if (!to) return logo;

  return (
    <Link to={to} className="block shrink-0">
      {logo}
    </Link>
  );
}
