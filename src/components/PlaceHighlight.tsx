'use client';

import { useMemo } from 'react';
import { Entity, PolygonGraphics } from 'resium';
import { Cartesian3, Color } from 'cesium';

interface GeoJSON {
  type: string;
  coordinates: any;
}

interface Props {
  geojson?: GeoJSON;
  boundingbox?: [string, string, string, string];
}

export default function PlaceHighlight({ geojson, boundingbox }: Props) {
  const hierarchy = useMemo(() => {
    if (geojson) {
      if (geojson.type === 'Polygon' && geojson.coordinates) {
        const ring = geojson.coordinates[0];
        return ring.map((coord: number[]) => 
          Cartesian3.fromDegrees(coord[0], coord[1])
        );
      }
      if (geojson.type === 'MultiPolygon' && geojson.coordinates) {
        const ring = geojson.coordinates[0][0];
        return ring.map((coord: number[]) => 
          Cartesian3.fromDegrees(coord[0], coord[1])
        );
      }
    }
    
    if (boundingbox) {
      const [south, north, west, east] = boundingbox.map(Number);
      return [
        Cartesian3.fromDegrees(west, south),
        Cartesian3.fromDegrees(east, south),
        Cartesian3.fromDegrees(east, north),
        Cartesian3.fromDegrees(west, north),
        Cartesian3.fromDegrees(west, south),
      ];
    }
    
    return null;
  }, [geojson, boundingbox]);

  if (!hierarchy) return null;

  return (
    <Entity>
      <PolygonGraphics
        hierarchy={hierarchy}
        material={Color.CYAN.withAlpha(0.2)}
        outline
        outlineColor={Color.CYAN}
        outlineWidth={2}
        height={1000}
      />
    </Entity>
  );
}
