'use client';

import { useSatellitePositions } from '@/hooks/useSatellitePositions';
import { Entity, PointGraphics, LabelGraphics } from 'resium';
import { Color, Cartesian2 } from 'cesium';

export default function Satellite() {
  const { positions } = useSatellitePositions(true);

  return (
    <>
      {positions.slice(0, 100).map((sat) => (
        <Entity 
          key={sat.id} 
          position={sat.position} 
          name={sat.name}
          description={`
            <div style="padding: 10px; font-family: sans-serif;">
              <h2 style="margin: 0 0 10px; color: #0a2540;">${sat.name}</h2>
              <p style="margin: 5px 0;"><strong>Satellite ID:</strong> ${sat.id}</p>
              <hr style="border: 1px solid #eee; margin: 10px 0;">
              <p style="margin: 5px 0; color: #666; font-size: 12px;">Two-Line Element (TLE) data</p>
            </div>
          `}
        >
          <PointGraphics pixelSize={5} color={Color.CYAN} />
          <LabelGraphics
            text={sat.name}
            font="10px sans-serif"
            pixelOffset={new Cartesian2(0, -10)}
            fillColor={Color.WHITE}
            showBackground
            backgroundColor={Color.BLACK.withAlpha(0.5)}
          />
        </Entity>
      ))}
    </>
  );
}