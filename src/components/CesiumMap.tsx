'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import {
  EllipsoidTerrainProvider,
  Ion,
  Viewer,
  OpenStreetMapImageryProvider,
  IonImageryProvider,
  IonWorldImageryStyle,
  EntityCluster,
  UrlTemplateImageryProvider,
  WebMapTileServiceImageryProvider
} from 'cesium';
import {
  Viewer as ResiumViewer,
  ImageryLayer,
  CesiumComponentRef
} from 'resium';
import * as Cesium from 'cesium';

import { LayerManager } from './CesiumMap/LayerManager';
import { SettingsDialog } from './CesiumMap/SettingsDialog';
import { SearchDialogs } from './CesiumMap/SearchDialogs';
import { MapOverlays } from './CesiumMap/MapOverlays';
import { ChokepointDashboard } from '@/components/ChokepointDashboard';
import { ScenarioPanel } from '@/components/ScenarioPanel';
import { AnnotationPanel } from '@/components/AnnotationPanel';
import { Timeline } from '@/components/Timeline';
import PlaceInfo from '@/components/PlaceInfo';

import { useCesiumMapState } from '@/hooks/useCesiumMapState';
import { useMapInteractions } from '@/hooks/useMapInteractions';

import 'cesium/Build/Cesium/Widgets/widgets.css';

if (typeof window !== 'undefined') {
  (window as any).CESIUM_BASE_URL = process.env.NEXT_PUBLIC_CESIUM_BASE_URL ?? '/cesium';
}


Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN || '';

export default function CesiumMap() {
  const viewerRef = useRef<CesiumComponentRef<Viewer>>(null);

  const state = useCesiumMapState();

  const interactions = useMapInteractions({ viewerRef, state });

  const [resolvedProviders, setResolvedProviders] = useState<Record<string, any>>({
    STREETS: new OpenStreetMapImageryProvider({ url: 'https://tile.openstreetmap.org/' }),
    TACTICAL: new UrlTemplateImageryProvider({
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      subdomains: 'abcd',
      maximumLevel: 20
    })
  });

  useEffect(() => {
    const initIon = async () => {
      if (!Ion.defaultAccessToken) {
        console.warn("ATOM_WARNING: NEXT_PUBLIC_CESIUM_ION_TOKEN is missing. SATELLITE and HYBRID views will not load.");
        return;
      }
      try {
        const satelliteProv = await IonImageryProvider.fromAssetId(2);
        const hybridProv = await IonImageryProvider.fromAssetId(3);

        setResolvedProviders((prev: Record<string, any>) => ({
          ...prev,
          SATELLITE: satelliteProv,
          HYBRID: hybridProv
        }));
      } catch (e) {
        console.error("Failed to initialize Ion Imagery. Ensure Ion Token is valid.", e);
      }
    };
    initIon();
  }, []);

  const activeProvider = resolvedProviders[state.activeImageryType] || resolvedProviders.STREETS;

  const terrainProvider = useMemo(() => new EllipsoidTerrainProvider(), []);
  const militaryClusterOptions = useMemo(() => new EntityCluster({
    enabled: true,
    pixelRange: 40,
    minimumClusterSize: 2,
  }), []);

  const handleCapture = () => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;
    const dataUrl = viewer.canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `atom_p_search_capture_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="relative w-full h-full bg-black">
      <ResiumViewer
        full
        ref={viewerRef}
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        geocoder={false}
        navigationHelpButton={false}
        homeButton={false}
        sceneModePicker={false}
        fullscreenButton={false}
        selectionIndicator={false}
        infoBox={true}
        terrainProvider={terrainProvider}
        contextOptions={{ webgl: { preserveDrawingBuffer: true } }}
        onClick={interactions.handleMapClick}
        shouldAnimate={true}
      >
        <ImageryLayer imageryProvider={activeProvider} />

        {/* layer manager */}
        <LayerManager state={state} militaryClusterOptions={militaryClusterOptions} />

        {/* <Timeline 
          startTime={state.startTime} 
          stopTime={state.stopTime} 
        /> */}
      </ResiumViewer>

      {/* alerts and modals */}
      <ChokepointDashboard
        chokepointId={state.selectedChokepoint}
        onClose={() => state.setSelectedChokepoint(null)}
        vesselCount={state.vesselPositions?.length || 0}
      />

      <ScenarioPanel
        active={state.isScenarioMode}
        units={state.scenarioUnits}
        onAddUnit={state.setPendingUnitType}
        onRemoveUnit={(id) => state.setScenarioUnits((prev: any) => prev.filter((u: any) => u.id !== id))}
        onClose={() => {
          state.setIsScenarioMode(false);
          state.setPendingUnitType(null);
        }}
      />

      <AnnotationPanel
        active={state.isAnnotationMode}
        annotations={state.annotations}
        onStartDrawing={state.setPendingAnnotationType}
        onSaveWorkspace={() => {
          localStorage.setItem('atom-workspace', JSON.stringify({ annotations: state.annotations, scenarioUnits: state.scenarioUnits }));
          alert("Analyst Workspace Saved Locally.");
        }}
        onExport={() => {
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ annotations: state.annotations, scenarioUnits: state.scenarioUnits }));
          const downloadAnchorNode = document.createElement('a');
          downloadAnchorNode.setAttribute("href", dataStr);
          downloadAnchorNode.setAttribute("download", "atom_geopolitics_export.json");
          document.body.appendChild(downloadAnchorNode);
          downloadAnchorNode.click();
          downloadAnchorNode.remove();
        }}
        onClear={() => state.setAnnotations([])}
        onClose={() => {
          state.setIsAnnotationMode(false);
          state.setPendingAnnotationType(null);
        }}
      />

      {/* dialogs */}
      <SearchDialogs
        {...state}
        handleSearch={interactions.handleSearch}
        flyToLocation={interactions.flyToLocation}
      />

      <SettingsDialog
        open={state.showSettings}
        onOpenChange={state.setShowSettings}
        state={state}
      />

      {/* hud and overlays */}
      <MapOverlays
        state={state}
        interactions={interactions}
        onCapture={handleCapture}
      />

      {state.selectedPlace && (
        <PlaceInfo
          place={state.selectedPlace}
          onClose={() => state.setSelectedPlace(null)}
        />
      )}
    </div>
  );
}
