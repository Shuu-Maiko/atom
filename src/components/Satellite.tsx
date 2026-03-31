'use client';

import { useSatellitePositions, type SatellitePosition } from '@/hooks/useSatellitePositions';
import { getSatelliteGroupId } from '@/lib/satellite-utils';
import { Entity, BillboardGraphics, LabelGraphics } from 'resium';
import { Color, Cartesian2, VerticalOrigin } from 'cesium';
import { useMemo } from 'react';
import { SATELLITE_GROUPS } from '@/lib/satellite-groups';

interface SatelliteProps {
  maxCount?: number;
  selectedGroups?: string[];
}

function getSatelliteColor(sat: SatellitePosition): Color {
  const groupId = getSatelliteGroupId(sat.name);
  const groupInfo = SATELLITE_GROUPS.find(g => g.id === groupId);
  return groupInfo ? Color.fromCssColorString(groupInfo.color) : Color.WHITE;
}

export default function Satellite({ maxCount = 150, selectedGroups }: SatelliteProps) {
  const { positions } = useSatellitePositions(true, selectedGroups);

  const filteredPositions = useMemo(() => {
    let filtered = positions;

    if (selectedGroups && selectedGroups.length > 0) {
      filtered = positions.filter(sat => {
        const groupId = getSatelliteGroupId(sat.name);
        return selectedGroups.includes(groupId);
      });
    }

    return filtered.slice(0, maxCount);
  }, [positions, maxCount, selectedGroups]);

  return (
    <>
      {filteredPositions.map((sat) => {
        const color = getSatelliteColor(sat);
        const groupId = getSatelliteGroupId(sat.name);
        const groupInfo = SATELLITE_GROUPS.find(g => g.id === groupId);
        
        return (
          <Entity 
            key={sat.id} 
            position={sat.position} 
            name={sat.name}
            description={`
              <div style="padding: 10px; font-family: sans-serif; max-width: 280px;">
                <h2 style="margin: 0 0 10px; color: #0a2540; font-size: 16px;">${sat.name}</h2>
                <p style="margin: 5px 0; font-size: 13px;"><strong>Satellite ID:</strong> ${sat.id}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>Group:</strong> ${groupInfo?.name || 'Unknown'}</p>
                <hr style="border: 1px solid #eee; margin: 10px 0;">
                <p style="margin: 5px 0; color: #666; font-size: 11px;">Two-Line Element (TLE) data from Celestrak</p>
              </div>
            `}
          >
            <BillboardGraphics 
              image="/icons/satellite.svg" 
              width={16} 
              height={16} 
              color={color} 
              disableDepthTestDistance={Number.POSITIVE_INFINITY}
            />
            <LabelGraphics
              text={sat.name}
              font="10px sans-serif"
              pixelOffset={new Cartesian2(0, -10)}
              fillColor={Color.WHITE}
              showBackground
              backgroundColor={Color.BLACK.withAlpha(0.5)}
            />
          </Entity>
        );
      })}
    </>
  );
}