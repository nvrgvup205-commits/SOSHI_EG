const SRC = '/logo.png';

const sizes = {
  hero: 'w-64 sm:w-80 md:w-96 lg:w-[26rem]',
  md: 'w-36',
  sm: 'w-20',
};

interface Props {
  className?: string;
  size?: keyof typeof sizes;
}

export default function AnimatedLogo({ className = '', size = 'hero' }: Props) {
  return (
    <img
      src={SRC}
      alt="Sushi Shop Egypt"
      className={`${sizes[size]} h-auto object-contain ${className}`}
      draggable={false}
    />
  );
}
