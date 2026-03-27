'use client';

import dynamic from 'next/dynamic';

const CesiumMap = dynamic(() => import('@/components/CesiumMap'), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-slate-900 flex items-center justify-center text-white">Initializing 3D World...</div>,
});

export default function Page() {
  return (
    <main className="h-screen w-full">
      <CesiumMap />
    </main>
  );
}
