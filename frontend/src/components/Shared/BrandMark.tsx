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
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  const { theme } = useTheme();

  return (
    <span className={`brand-mark brand-mark-${theme} ${className}`}>
      <img
        src="/logo-light.png"
        alt="Sushi Shop Egypt"
        className={`${sizes[size]} w-auto max-w-[min(100%,22rem)] object-contain`}
      />
    </span>
  );
}
