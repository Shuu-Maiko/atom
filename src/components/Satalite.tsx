'use client';

import { useSatellitePositions } from '@/hooks/useSatellitePositions';
import { Entity, PointGraphics, LabelGraphics } from 'resium';
import { Color, Cartesian2 } from 'cesium';

export default function Satellite() {
  const { positions, loading, error } = useSatellitePositions();

  if (loading) {
    return <div className="p-4 text-white">Loading satellites... ({positions.length})</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  console.log('Rendering satellites:', positions.length);

  return (
    <>
      {positions.slice(0, 50).map((sat, i) => (
        <Entity key={`${sat.name}-${i}`} position={sat.position} name={sat.name}>
          <PointGraphics pixelSize={8} color={Color.YELLOW} />
          <LabelGraphics
            text={sat.name}
            font="12px sans-serif"
            pixelOffset={new Cartesian2(0, -15)}
            fillColor={Color.WHITE}
            showBackground
          />
        </Entity>
      ))}
    </>
  );
}