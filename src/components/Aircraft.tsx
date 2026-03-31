'use client';

import { useAircraftPositions } from '@/hooks/useAircraftPositions';
import { Math as CesiumMath, Cartesian2, Color } from 'cesium';
import { Entity, BillboardGraphics, LabelGraphics } from 'resium';

export const Aircraft = () => {
  const { positions } = useAircraftPositions(true);

  return (
    <>
      {positions.map((plane) => {
        return (
          <Entity 
            key={plane.icao24} 
            position={plane.position} 
            name={plane.callSign}
            description={`
              <div style="padding: 10px; font-family: sans-serif;">
                <h2 style="margin: 0 0 10px; color: #1a1a2e;">${plane.callSign}</h2>
                <p style="margin: 5px 0;"><strong>Country:</strong> ${plane.country}</p>
                <p style="margin: 5px 0;"><strong>Altitude:</strong> ${plane.altitude?.toLocaleString()} m</p>
                <p style="margin: 5px 0;"><strong>Speed:</strong> ${plane.velocity?.toLocaleString()} m/s</p>
                <p style="margin: 5px 0;"><strong>Heading:</strong> ${plane.heading?.toFixed(1)} deg</p>
                <hr style="border: 1px solid #eee; margin: 10px 0;">
                <p style="margin: 5px 0; color: #666; font-size: 12px;">ICAO: ${plane.icao24}</p>
              </div>
            `}
          >
            <BillboardGraphics 
              image="/icons/aircraft.svg" 
              width={24} 
              height={24} 
              color={Color.YELLOW} 
              rotation={-CesiumMath.toRadians(plane.heading || 0)} 
              disableDepthTestDistance={Number.POSITIVE_INFINITY}
            />
            <LabelGraphics
              text={plane.callSign}
              font="10px sans-serif"
              pixelOffset={new Cartesian2(0, -10)}
              fillColor={Color.WHITE}
              showBackground
              backgroundColor={Color.BLACK.withAlpha(0.5)}
              disableDepthTestDistance={Number.POSITIVE_INFINITY}
            />
          </Entity>
        );
      })}
    </>
  );
};

