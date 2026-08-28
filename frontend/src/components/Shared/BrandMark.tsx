import { useTheme } from '../../hooks/useTheme';

const sizes = {
  sm: 'h-9',
  md: 'h-16',
  lg: 'h-24',
  hero: 'h-32 sm:h-40',
} as const;

export default function BrandMark({
  size = 'md',
  className = '',
  surface,
}: {
  size?: keyof typeof sizes;
  className?: string;
  surface?: 'dark' | 'light';
}) {
  const { theme } = useTheme();
  const onDark = surface === 'dark' || (surface !== 'light' && theme === 'dark');
  const logoSrc = onDark ? '/logo.png' : '/logo-light.png';

  return (
    <span className={`brand-mark inline-flex ${className}`}>
      <img
        src={logoSrc}
        alt="SUSHI SHOP EGYPT"
        className={`brand-mark-img ${sizes[size]} w-auto max-w-[min(100%,14rem)] object-contain`}
        draggable={false}
        onError={(e) => {
          const img = e.currentTarget;
          if (!img.src.endsWith('/favicon.svg')) img.src = '/favicon.svg';
        }}
      />
    </span>
  );
}
