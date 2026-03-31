"use client";

import { useCallback } from 'react';
import { 
  Cartesian3, 
  Cartographic, 
  JulianDate,
  Math as CesiumMath
} from 'cesium';
import { CesiumComponentRef } from 'resium';
import { searchPlaces, getAreaFromCoords } from '@/app/actions/geocode';

interface InteractionProps {
  viewerRef: React.RefObject<CesiumComponentRef<any> | null>;
  state: any;
}

export function useMapInteractions({ viewerRef, state }: InteractionProps) {
  const {
    setSelectedChokepoint,
    isTacticalActive, setTacticalPoints,
    isAddingMarker, setPendingMarkerCoords, setShowMarkerDialog,
    setSelectedPlace,
    setSearchResults,
    setShowSearch,
    isScenarioMode, pendingUnitType, setScenarioUnits, setPendingUnitType,
    isAnnotationMode, pendingAnnotationType, setAnnotations, setPendingAnnotationType,
    annotations
  } = state;

  const resetCamera = useCallback(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(0, 0, 20000000),
      duration: 2,
    });
  }, [viewerRef]);

  const clearSelection = useCallback(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;
    viewer.selectedEntity = undefined;
    setSelectedPlace(null);
  }, [viewerRef, setSelectedPlace]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchPlaces(query);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
  }, [setSearchResults]);

  const flyToLocation = useCallback((lat: number, lon: number) => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(lon, lat, 500000),
      duration: 2,
    });
    setShowSearch(false);
  }, [viewerRef, setShowSearch]);

  const handleMapClick = useCallback(async (movement: any) => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer || !movement.position) return;

    const pickedObject = viewer.scene.pick(movement.position);
    if (pickedObject && pickedObject.id) {
      const entityId = pickedObject.id.id;
      if (entityId.startsWith('choke-')) {
        setSelectedChokepoint(entityId);
        return;
      }
    }

    const position = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
    if (!position) return;

    if (isTacticalActive) {
      setTacticalPoints((prev: Cartesian3[]) => {
        const next = [...prev, position];
        return next.length > 2 ? [position] : next;
      });
      return;
    }

    const cartographic = Cartographic.fromCartesian(position);
    const lat = CesiumMath.toDegrees(cartographic.latitude);
    const lon = CesiumMath.toDegrees(cartographic.longitude);

    if (isAddingMarker) {
      setPendingMarkerCoords({ lat, lon });
      setShowMarkerDialog(true);
      return;
    }

    if (isScenarioMode && pendingUnitType) {
      const id = `scenario-${Date.now()}`;
      setScenarioUnits((prev: any[]) => [...prev, {
        id,
        name: `New ${pendingUnitType} Unit`,
        type: pendingUnitType,
        side: 'friendly',
        lat,
        lon,
      }]);
      setPendingUnitType(null);
      return;
    }

    if (isAnnotationMode && pendingAnnotationType) {
      const id = `annot-${Date.now()}`;
      setAnnotations((prev: any[]) => [...prev, {
        id,
        type: pendingAnnotationType,
        name: `Markup ${annotations.length + 1}`,
        color: '#06b6d4',
        positions: [{ lat, lon }],
        timestamp: Date.now(),
      }]);
      setPendingAnnotationType(null);
      return;
    }

    try {
      const place = await getAreaFromCoords(lat, lon);
      setSelectedPlace({ ...place, clickLat: lat, clickLon: lon });
    } catch {
      setSelectedPlace({ 
        display_name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        type: 'coordinates',
        clickLat: lat, 
        clickLon: lon 
      });
    }
  }, [
    viewerRef, setSelectedChokepoint, isTacticalActive, setTacticalPoints,
    isAddingMarker, setPendingMarkerCoords, setShowMarkerDialog,
    isScenarioMode, pendingUnitType, setScenarioUnits, setPendingUnitType,
    isAnnotationMode, pendingAnnotationType, setAnnotations, setPendingAnnotationType,
    annotations.length, setSelectedPlace
  ]);

  const setTimeFromSlider = useCallback((value: number | readonly number[], startTime: JulianDate, stopTime: JulianDate) => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;
    const totalSeconds = JulianDate.secondsDifference(stopTime, startTime);
    const sliderValue = Array.isArray(value) ? value[0] : value;
    const offset = (sliderValue / 100) * totalSeconds;
    viewer.clock.currentTime = JulianDate.addSeconds(startTime, offset, new JulianDate());
  }, [viewerRef]);

  return {
    resetCamera,
    clearSelection,
    handleSearch,
    flyToLocation,
    handleMapClick,
    setTimeFromSlider
  };
}
