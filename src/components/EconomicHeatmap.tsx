"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { 
  SingleTileImageryProvider, 
  Rectangle, 
  Cartesian2 
} from 'cesium';
import { ImageryLayer } from 'resium';

interface HeatmapPoint {
  lat: number;
  lon: number;
  value: number;
}

interface EconomicHeatmapProps {
  enabled: boolean;
}

export function EconomicHeatmap({ enabled }: EconomicHeatmapProps) {
  const [imageryProvider, setImageryProvider] = useState<SingleTileImageryProvider | null>(null);

  const heatmapData = useMemo<HeatmapPoint[]>(() => [
    { lat: 35.6895, lon: 139.6917, value: 0.9 },
    { lat: 31.2304, lon: 121.4737, value: 0.8 },
    { lat: 40.7128, lon: -74.0060, value: 1.0 },
    { lat: 51.5074, lon: -0.1278, value: 0.85 },
    { lat: 25.2048, lon: 55.2708, value: 0.7 },
    { lat: 1.3521, lon: 103.8198, value: 0.75 },
    { lat: -23.5505, lon: -46.6333, value: 0.5 },
    { lat: -33.8688, lon: 151.2093, value: 0.6 },
    { lat: 19.4326, lon: -99.1332, value: 0.4 },
    { lat: 28.6139, lon: 77.2090, value: 0.55 },
    { lat: 55.7558, lon: 37.6173, value: 0.45 },
    { lat: -1.2921, lon: 36.8219, value: 0.3 },
  ], []);

  useEffect(() => {
    if (!enabled) {
      setImageryProvider(null);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    heatmapData.forEach(point => {
      const x = ((point.lon + 180) / 360) * canvas.width;
      const y = ((90 - point.lat) / 180) * canvas.height;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 40);
      gradient.addColorStop(0, `rgba(6, 182, 212, ${point.value * 0.8})`);
      gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x - 40, y - 40, 80, 80);
    });

    const provider = new SingleTileImageryProvider({
      url: canvas.toDataURL(),
      rectangle: Rectangle.fromDegrees(-180, -90, 180, 90),
    });

    setImageryProvider(provider);
  }, [enabled, heatmapData]);

  if (!enabled || !imageryProvider) return null;

  return <ImageryLayer imageryProvider={imageryProvider} alpha={0.6} />;
}
