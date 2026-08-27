import { lazy, Suspense } from 'react';

const Stage = lazy(() => import('./SushiStage'));

export default function SushiStageLazy({ className }: { className?: string }) {
  return (
    <Suspense fallback={null}>
      <Stage className={className} />
    </Suspense>
  );
}
