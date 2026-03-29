'use client';

import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import {
  OpenStreetMapImageryProvider,
  EllipsoidTerrainProvider,
  Ion,
  Viewer,
  Cartesian3,
  Cartographic,
} from 'cesium';
import { Math as CesiumMath } from 'cesium';
import { getAreaFromCoords } from '@/app/actions/geocode';
import { Viewer as ResiumViewer, ImageryLayer, CesiumComponentRef } from 'resium';
import Satellite from './Satalite';
import { Aircraft } from './Aircraft';
import PlaceInfo from './PlaceInfo';
import PlaceHighlight from './PlaceHighlight';
import { Layers, Plane, Satellite as SatelliteIcon, RotateCcw, X, MapPin, Search } from 'lucide-react';
import 'cesium/Build/Cesium/Widgets/widgets.css';


if (typeof window !== 'undefined') {
  (window as any).CESIUM_BASE_URL =
    process.env.NEXT_PUBLIC_CESIUM_BASE_URL ?? '/cesium';
}


Ion.defaultAccessToken = '';

export default function CesiumMap() {
  const viewerRef = useRef<CesiumComponentRef<Viewer>>(null);
  const [showSatellites, setShowSatellites] = useState(false);
  const [showAircraft, setShowAircraft] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

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

  const clearSelection = useCallback(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;
    viewer.selectedEntity = undefined;
    setSelectedPlace(null);
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;

    viewer.imageryLayers.removeAll();
    viewer.imageryLayers.addImageryProvider(osmProvider);
  }, [osmProvider]);

  return (
    <div className="h-screen w-full relative bg-black">
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
        infoBox
        selectionIndicator
        onClick={async (movement) => {
          const viewer = viewerRef.current?.cesiumElement;
          if (!viewer || !movement.position) return;

          const position = viewer.camera.pickEllipsoid(movement.position);
          if (!position) return;

          const cartographic = Cartographic.fromCartesian(position);
          const lat = CesiumMath.toDegrees(cartographic.latitude);
          const lon = CesiumMath.toDegrees(cartographic.longitude);

          try {
            const place = await getAreaFromCoords(lat, lon);
            setSelectedPlace({ ...place, clickLat: lat, clickLon: lon });
          } catch (err) {
            console.error('Failed to get place:', err);
            setSelectedPlace({ 
              display_name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
              type: 'coordinates',
              clickLat: lat, 
              clickLon: lon 
            });
          }
        }}
      >
        <ImageryLayer imageryProvider={osmProvider} />
        {selectedPlace && (selectedPlace.boundingbox || selectedPlace.geojson) && (
          <PlaceHighlight 
            geojson={selectedPlace.geojson} 
            boundingbox={selectedPlace.boundingbox} 
          />
        )}
        {showSatellites && <Satellite />}
        {showAircraft && <Aircraft />}
      </ResiumViewer>

      {false && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <button className="flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur border border-white/20 rounded-lg text-white/50 cursor-not-allowed">
            <Search className="w-4 h-4" />
            <span className="text-sm">Search (API rate limited)</span>
          </button>
        </div>
      )}

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="flex items-center gap-2 px-3 py-2 bg-black/80 backdrop-blur border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span className="text-sm">Layers</span>
          </button>
          
          {showLayerMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-black/90 backdrop-blur border border-white/20 rounded-lg overflow-hidden">
              <button
                onClick={() => { setShowSatellites(!showSatellites); setShowLayerMenu(false); }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-colors text-white"
              >
                <div className="flex items-center gap-2">
                  <SatelliteIcon className="w-4 h-4" />
                  <span className="text-sm">Satellites</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${showSatellites ? 'bg-cyan-400' : 'bg-white/20'}`} />
              </button>
              <button
                onClick={() => { setShowAircraft(!showAircraft); setShowLayerMenu(false); }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-colors text-white"
              >
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  <span className="text-sm">Aircraft</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${showAircraft ? 'bg-yellow-400' : 'bg-white/20'}`} />
              </button>
            </div>
          )}
        </div>

        <button
          onClick={resetCamera}
          className="p-2 bg-black/80 backdrop-blur border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
          title="Reset view"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        
        {selectedPlace && (
          <button
            onClick={clearSelection}
            className="p-2 bg-black/80 backdrop-blur border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3">
        {showAircraft && (
          <div className="flex items-center gap-2 px-3 py-2 bg-black/80 backdrop-blur border border-white/20 rounded-lg">
            <Plane className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm font-medium">Active</span>
          </div>
        )}
        {showSatellites && (
          <div className="flex items-center gap-2 px-3 py-2 bg-black/80 backdrop-blur border border-white/20 rounded-lg">
            <SatelliteIcon className="w-4 h-4 text-cyan-400" />
            <span className="text-white text-sm font-medium">Active</span>
          </div>
        )}
      </div>

      {selectedPlace && (
        <PlaceInfo place={selectedPlace} onClose={() => setSelectedPlace(null)} />
      )}
    </div>
  );
}
