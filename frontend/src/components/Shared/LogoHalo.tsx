export default function LogoHalo({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`logo-halo ${className}`}>
      <span className="logo-halo-glow" aria-hidden />
      <span className="relative z-[1]">{children}</span>
    </div>
  );
}
