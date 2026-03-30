'use client';

import { useVesselPositions, isMilitaryVessel, getVesselStyle } from '@/hooks/useVesselPositions';
import type { Vessel as VesselType } from '@/lib/vessel-data';
import { Cartesian2, Color } from 'cesium';
import { Entity, PointGraphics, LabelGraphics, PolylineGraphics } from 'resium';
import { useMemo } from 'react';

interface VesselProps {
  showRoutes?: boolean;
  filterMilitary?: boolean;
}

export default function Vessel({ showRoutes = false, filterMilitary = false }: VesselProps) {
  const { positions } = useVesselPositions(true);

  const filteredPositions = useMemo(() => {
    if (filterMilitary) {
      return positions.filter(isMilitaryVessel);
    }
    return positions;
  }, [positions, filterMilitary]);

  return (
    <>
      {filteredPositions.map((vessel) => {
        const style = getVesselStyle(vessel);
        const color = Color.fromCssColorString(style.color);
        
        const courseRad = (vessel.course * Math.PI) / 180;
        const routeLength = vessel.speed * 0.01;
        const endLat = vessel.position ? 
          (vessel.position as any).y / 10000000 + routeLength * Math.cos(courseRad) : 0;
        const endLon = vessel.position ? 
          (vessel.position as any).x / 10000000 + routeLength * Math.sin(courseRad) / Math.cos(endLat * Math.PI / 180) : 0;
        
        return (
          <Entity 
            key={vessel.mmsi} 
            position={vessel.position} 
            name={vessel.name}
            description={`
              <div style="padding: 10px; font-family: sans-serif; max-width: 300px;">
                <h2 style="margin: 0 0 10px; color: #1a1a2e; font-size: 16px;">${vessel.name}</h2>
                <p style="margin: 5px 0; font-size: 13px;"><strong>Callsign:</strong> ${vessel.callsign}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>Country:</strong> ${vessel.country}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>Type:</strong> ${vessel.shipType}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>Status:</strong> ${vessel.status}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>Speed:</strong> ${vessel.speed.toFixed(1)} knots</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>Course:</strong> ${vessel.course.toFixed(0)}°</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>Destination:</strong> ${vessel.destination}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>ETA:</strong> ${vessel.eta}</p>
                <hr style="border: 1px solid #eee; margin: 10px 0;">
                <p style="margin: 5px 0; color: #666; font-size: 11px;">MMSI: ${vessel.mmsi}</p>
                <p style="margin: 5px 0; color: #666; font-size: 11px;">Size: ${vessel.length}m × ${vessel.width}m</p>
              </div>
            `}
          >
            <PointGraphics pixelSize={style.size} color={color} />
            <LabelGraphics
              text={vessel.name}
              font="10px sans-serif"
              pixelOffset={new Cartesian2(0, -15)}
              fillColor={Color.WHITE}
              showBackground
              backgroundColor={Color.BLACK.withAlpha(0.6)}
            />
            {showRoutes && vessel.speed > 0 && (
              <PolylineGraphics
                positions={[vessel.position, vessel.position]}
                width={1}
                material={color.withAlpha(0.5)}
              />
            )}
          </Entity>
        );
      })}
    </>
  );
}
