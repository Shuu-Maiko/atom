'use client';

import { Entity, BillboardGraphics, LabelGraphics } from 'resium';
import { Cartesian3, Cartesian2, Color, VerticalOrigin, HorizontalOrigin, LabelStyle, HeightReference } from 'cesium';
import type { CustomMarker } from '@/hooks/useCustomMarkers';

const MARKER_COLORS: Record<CustomMarker['type'], string> = {
  general: '#22d3ee',
  military: '#ef4444',
  alert: '#f59e0b',
  waypoint: '#a855f7',
};

const MARKER_TYPE_LABELS: Record<CustomMarker['type'], string> = {
  general: 'General',
  military: 'Military',
  alert: 'Alert',
  waypoint: 'Waypoint',
};

interface CustomMarkersProps {
  markers: CustomMarker[];
}

export default function CustomMarkers({ markers }: CustomMarkersProps) {
  return (
    <>
      {markers.map((marker) => {
        const color = MARKER_COLORS[marker.type];
        const cesiumColor = Color.fromCssColorString(color);
        
        return (
          <Entity
            key={marker.id}
            position={Cartesian3.fromDegrees(marker.lon, marker.lat, 0)}
            name={marker.name}
            description={`
              <div style="font-family: monospace; padding: 8px;">
                <p><strong>Name:</strong> ${marker.name}</p>
                <p><strong>Type:</strong> ${MARKER_TYPE_LABELS[marker.type]}</p>
                <p><strong>Latitude:</strong> ${marker.lat.toFixed(6)}</p>
                <p><strong>Longitude:</strong> ${marker.lon.toFixed(6)}</p>
                <p><strong>Created:</strong> ${new Date(marker.createdAt).toLocaleString()}</p>
              </div>
            `}
          >
            <BillboardGraphics 
              image="/icons/tactical-unit.svg"
              width={24} 
              height={24} 
              color={cesiumColor} 
              disableDepthTestDistance={Number.POSITIVE_INFINITY}
            />
            <LabelGraphics
              text={marker.name}
              font="12px sans-serif"
              fillColor={Color.WHITE}
              outlineColor={Color.BLACK}
              outlineWidth={2}
              style={LabelStyle.FILL_AND_OUTLINE}
              pixelOffset={new Cartesian2(0, -20)}
              verticalOrigin={VerticalOrigin.BOTTOM}
              horizontalOrigin={HorizontalOrigin.CENTER}
            />
          </Entity>
        );
      })}
    </>
  );
}
