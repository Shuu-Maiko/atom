'use client';

import { useSatellitePositions, type SatellitePosition } from '@/hooks/useSatellitePositions';
import { Entity, PointGraphics, LabelGraphics } from 'resium';
import { Color, Cartesian2 } from 'cesium';
import { useMemo } from 'react';
import { SATELLITE_GROUPS } from '@/lib/satellite-groups';

interface SatelliteProps {
  maxCount?: number;
  selectedGroups?: string[];
}

function getSatelliteGroup(sat: SatellitePosition): string {
  const name = sat.name.toLowerCase();
  
  if (name.includes('starlink')) return 'starlink';
  if (name.includes('iridium')) return 'iridium-NEXT';
  if (name.includes('gps') || name.includes('navstar')) return 'gps-ops';
  if (name.includes('glonass') || name.includes('kosmos')) return 'glo-ops';
  if (name.includes('galileo')) return 'galileo';
  if (name.includes('beidou') || name.includes('compass')) return 'beidou';
  if (name.includes('noaa') || name.includes('goes') || name.includes('meteosat') || name.includes('metop')) return 'weather';
  if (name.includes('landsat') || name.includes('sentinel') || name.includes('worldview')) return 'earth-observation';
  if (name.includes('intelsat') || name.includes('ses') || name.includes('eutelsat')) return 'communications';
  if (name.includes('hubble') || name.includes('xmm') || name.includes('integral')) return 'science';
  if (name.includes('planet')) return 'planet';
  if (name.includes('spire')) return 'spire';
  if (name.includes('tdrs')) return 'tdrss';
  if (name.includes('iss') || name.includes('tiangong') || name.includes('hst')) return 'visual';
  
  return 'visual';
}

function getSatelliteColor(sat: SatellitePosition): Color {
  const group = getSatelliteGroup(sat);
  const groupInfo = SATELLITE_GROUPS.find(g => g.id === group);
  return groupInfo ? Color.fromCssColorString(groupInfo.color) : Color.CYAN;
}

export default function Satellite({ maxCount = 150, selectedGroups }: SatelliteProps) {
  const { positions } = useSatellitePositions(true);

  const filteredPositions = useMemo(() => {
    let filtered = positions;
    
    if (selectedGroups && selectedGroups.length > 0) {
      filtered = positions.filter(sat => {
        const group = getSatelliteGroup(sat);
        return selectedGroups.includes(group);
      });
    }
    
    return filtered.slice(0, maxCount);
  }, [positions, maxCount, selectedGroups]);

  return (
    <>
      {filteredPositions.map((sat) => {
        const color = getSatelliteColor(sat);
        const group = getSatelliteGroup(sat);
        const groupInfo = SATELLITE_GROUPS.find(g => g.id === group);
        
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
            <PointGraphics pixelSize={5} color={color} />
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