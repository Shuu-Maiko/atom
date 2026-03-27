'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';
import {
  OpenStreetMapImageryProvider,
  EllipsoidTerrainProvider,
  Ion,
  Viewer,
  Cartesian3,
} from 'cesium';
import { Viewer as ResiumViewer, ImageryLayer, CesiumComponentRef } from 'resium';
import Satellite from './Satalite';
import 'cesium/Build/Cesium/Widgets/widgets.css';


if (typeof window !== 'undefined') {
  (window as any).CESIUM_BASE_URL =
    process.env.NEXT_PUBLIC_CESIUM_BASE_URL ?? '/cesium';
}


Ion.defaultAccessToken = '';

export default function CesiumMap() {
  const viewerRef = useRef<CesiumComponentRef<Viewer>>(null);

  const osmProvider = useMemo(
    () =>
      new OpenStreetMapImageryProvider({
        url: 'https://tile.openstreetmap.org/',
      }),
    []
  );

  const terrainProvider = useMemo(() => new EllipsoidTerrainProvider(), []);

  const resetCamera = useCallback(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(0, 0, 20000000),
      duration: 2,
    });
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;

    viewer.imageryLayers.removeAll();
    viewer.imageryLayers.addImageryProvider(osmProvider);
  }, [osmProvider]);

  return (
    <div className="h-screen w-full relative">
      <ResiumViewer
        ref={viewerRef}
        full
        baseLayerPicker={false}
        geocoder={false}
        homeButton={false}
        sceneModePicker={false}
        navigationHelpButton={false}
        terrainProvider={terrainProvider}
        animation={false}
        timeline={false}
      >
        <ImageryLayer imageryProvider={osmProvider} />
        <Satellite />
      </ResiumViewer>
      <button
        onClick={resetCamera}
        className="absolute top-4 right-4 z-10 px-4 py-2 bg-slate-800 text-white rounded shadow hover:bg-slate-700"
      >
        Reset View
      </button>
    </div>
  );
}
