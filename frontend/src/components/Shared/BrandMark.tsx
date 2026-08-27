import { useTheme } from '../../hooks/useTheme';

const sizes = {
  sm: 'h-10',
  md: 'h-20',
  lg: 'h-32',
  hero: 'h-44 sm:h-56 md:h-64',
} as const;

export default function BrandMark({
  size = 'md',
  className = '',
  surface,
}: {
  size?: keyof typeof sizes;
  className?: string;
  /** Force logo variant for a dark or light background instead of following theme. */
  surface?: 'dark' | 'light';
}) {
  const { theme } = useTheme();
  const onDark = surface === 'dark' || (surface !== 'light' && theme === 'dark');
  const logoSrc = onDark ? '/logo.png' : '/logo-light.png';

  return (
    <span className={`brand-mark brand-mark-${onDark ? 'dark' : 'light'} ${className}`}>
      <img
        src={logoSrc}
        alt="Sushi Shop Egypt"
        className={`${sizes[size]} w-auto max-w-[min(100%,22rem)] object-contain`}
      />
    </span>
  );
}
