"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Cartesian3, 
  Color, 
  JulianDate,
  VerticalOrigin,
  HeightReference,
  Cartographic
} from 'cesium';
import { Entity, PolylineGraphics, BillboardGraphics } from 'resium';
import { useCesium } from 'resium';

interface LineOfSightData {
  start: Cartesian3;
  end: Cartesian3;
  isVisible: boolean;
  points: Cartesian3[];
}

interface TacticalToolsProps {
  active: boolean;
  onPointSelected: (point: Cartesian3) => void;
  selectedPoints: Cartesian3[];
}

export function TacticalTools({ active, selectedPoints }: TacticalToolsProps) {
  const { viewer } = useCesium();
  const [losData, setLosData] = useState<LineOfSightData | null>(null);

  const calculateLOS = useCallback(async () => {
    if (!viewer || selectedPoints.length < 2) {
      setLosData(null);
      return;
    }

    const start = selectedPoints[0];
    const end = selectedPoints[1];
    
    const samples = 50;
    const points: Cartesian3[] = [];
    let isVisible = true;

    for (let i = 0; i <= samples; i++) {
        const factor = i / samples;
        const lerped = Cartesian3.lerp(start, end, factor, new Cartesian3());
        
        const carto = Cartographic.fromCartesian(lerped);
        const terrainHeight = viewer.scene.globe.getHeight(carto) || 0;
        
        if (carto.height < terrainHeight) {
            isVisible = false;
        }
        points.push(lerped);
    }

    setLosData({ start, end, isVisible, points });
  }, [viewer, selectedPoints]);

  useEffect(() => {
    if (selectedPoints.length === 2) {
      calculateLOS();
    } else {
      setLosData(null);
    }
  }, [selectedPoints, calculateLOS]);

  if (!active || selectedPoints.length === 0) return null;

  return (
    <>
      {selectedPoints.map((p, i) => (
        <Entity key={`point-${i}`} position={p}>
          <BillboardGraphics 
            image="/icons/tactical-unit.svg"
            width={20} 
            height={20} 
            color={Color.CYAN} 
            disableDepthTestDistance={Number.POSITIVE_INFINITY}
          />
        </Entity>
      ))}
      {losData && (
        <Entity>
          <PolylineGraphics
            positions={[losData.start, losData.end]}
            width={3}
            material={losData.isVisible ? Color.LIME : Color.RED}
            arcType={0}
          />
        </Entity>
      )}
    </>
  );
}
