const sizes = {
  sm: 'brand-lockup-sm',
  md: 'brand-lockup-md',
  lg: 'brand-lockup-lg',
  hero: 'brand-lockup-hero',
} as const;

interface Props {
  size?: keyof typeof sizes;
  className?: string;
}

export default function BrandName({ size = 'md', className = '' }: Props) {
  return (
    <div className={`brand-lockup ${sizes[size]} ${className}`} aria-label="Sushi Shop Egypt">
      <span className="brand-shop">Sushi Shop</span>
      <div className="brand-egypt-row">
        <span className="brand-rule" aria-hidden />
        <span className="brand-diamond" aria-hidden />
        <span className="brand-egypt">Egypt</span>
        <span className="brand-diamond" aria-hidden />
        <span className="brand-rule brand-rule-end" aria-hidden />
      </div>
    </div>
  );
}
