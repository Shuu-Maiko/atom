"use client";

import { useState, useMemo, useCallback } from 'react';
import { JulianDate, Cartesian3 } from 'cesium';
import { useVesselPositions } from '@/hooks/useVesselPositions';
import { useCustomMarkers } from '@/hooks/useCustomMarkers';
import { useEEZBoundaries } from '@/hooks/useEEZBoundaries';
import { useDisputedBorders } from '@/hooks/useDisputedBorders';
import { useStrategicPorts } from '@/hooks/useStrategicPorts';
import { useConflictEvents } from '@/hooks/useConflictEvents';
import { useInfrastructure } from '@/hooks/useInfrastructure';
import { useMilitaryBases } from '@/hooks/useMilitaryBases';
import { ScenarioUnit } from '@/types/geopolitics.d';
import { MapAnnotation } from '@/types/annotations.d';
import { CustomMarker } from '@/hooks/useCustomMarkers';

export function useCesiumMapState() {
  const [showSatellites, setShowSatellites] = useState(true);
  const [showAircraft, setShowAircraft] = useState(false);
  const [showVessels, setShowVessels] = useState(false);
  const [showEEZ, setShowEEZ] = useState(false);
  const [showBorders, setShowBorders] = useState(false);
  const [showPorts, setShowPorts] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [showCables, setShowCables] = useState(false);
  const [showPipelines, setShowPipelines] = useState(false);
  const [showMilitaryBases, setShowMilitaryBases] = useState(false);
  const [showSensors, setShowSensors] = useState(false);
  const [showEconomy, setShowEconomy] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeImageryType, setActiveImageryType] = useState<'STREETS' | 'SATELLITE' | 'TACTICAL' | 'HYBRID'>('STREETS');

  const [isTacticalActive, setIsTacticalActive] = useState(false);
  const [isScenarioMode, setIsScenarioMode] = useState(false);
  const [scenarioUnits, setScenarioUnits] = useState<ScenarioUnit[]>([]);
  const [pendingUnitType, setPendingUnitType] = useState<ScenarioUnit['type'] | null>(null);
  const [isAnnotationMode, setIsAnnotationMode] = useState(false);
  const [annotations, setAnnotations] = useState<MapAnnotation[]>([]);
  const [pendingAnnotationType, setPendingAnnotationType] = useState<MapAnnotation['type'] | null>(null);
  const [tacticalPoints, setTacticalPoints] = useState<Cartesian3[]>([]);
  const [selectedChokepoint, setSelectedChokepoint] = useState<string | null>(null);

  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [selectedSatGroups, setSelectedSatGroups] = useState<string[]>([]);
  const [satelliteCount, setSatelliteCount] = useState(150);
  const [filterMilitaryOnly, setFilterMilitaryOnly] = useState(false);
  const [showVesselRoutes, setShowVesselRoutes] = useState(false);

  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [showMarkerDialog, setShowMarkerDialog] = useState(false);
  const [pendingMarkerCoords, setPendingMarkerCoords] = useState<{lat: number, lon: number} | null>(null);
  const [markerName, setMarkerName] = useState('');
  const [markerType, setMarkerType] = useState<CustomMarker['type']>('general');

  const { positions: vesselPositions, loading: vesselsLoading } = useVesselPositions(showVessels);
  const { markers, addMarker, removeMarker, clearAll } = useCustomMarkers();
  const { data: eezData, loading: eezLoading } = useEEZBoundaries(showEEZ);
  const { data: bordersData, loading: bordersLoading } = useDisputedBorders(showBorders);
  const { data: portsData, loading: portsLoading } = useStrategicPorts(showPorts);
  const { data: conflictData, loading: conflictLoading } = useConflictEvents(showConflicts);
  const { data: cablesData, loading: cablesLoading } = useInfrastructure('cable', showCables);
  const { data: pipelinesData, loading: pipelinesLoading } = useInfrastructure('pipeline', showPipelines);
  const { data: militaryBases, loading: basesLoading } = useMilitaryBases(showMilitaryBases);

  const startTime = useMemo(() => JulianDate.addDays(JulianDate.now(), -1, new JulianDate()), []);
  const stopTime = useMemo(() => JulianDate.addDays(JulianDate.now(), 1, new JulianDate()), []);

  return {
    showSatellites, setShowSatellites,
    showAircraft, setShowAircraft,
    showVessels, setShowVessels,
    showEEZ, setShowEEZ,
    showBorders, setShowBorders,
    showPorts, setShowPorts,
    showConflicts, setShowConflicts,
    showCables, setShowCables,
    showPipelines, setShowPipelines,
    showMilitaryBases, setShowMilitaryBases,
    showSensors, setShowSensors,
    showEconomy, setShowEconomy,
    showLayerMenu, setShowLayerMenu,
    showSettings, setShowSettings,
    showSearch, setShowSearch,
    activeImageryType, setActiveImageryType,

    isTacticalActive, setIsTacticalActive,
    isScenarioMode, setIsScenarioMode,
    scenarioUnits, setScenarioUnits,
    pendingUnitType, setPendingUnitType,
    isAnnotationMode, setIsAnnotationMode,
    annotations, setAnnotations,
    pendingAnnotationType, setPendingAnnotationType,
    tacticalPoints, setTacticalPoints,
    selectedChokepoint, setSelectedChokepoint,

    selectedPlace, setSelectedPlace,
    searchQuery, setSearchQuery,
    searchResults, setSearchResults,

    selectedSatGroups, setSelectedSatGroups,
    satelliteCount, setSatelliteCount,
    filterMilitaryOnly, setFilterMilitaryOnly,
    showVesselRoutes, setShowVesselRoutes,

    isAddingMarker, setIsAddingMarker,
    showMarkerDialog, setShowMarkerDialog,
    pendingMarkerCoords, setPendingMarkerCoords,
    markerName, setMarkerName,
    markerType, setMarkerType,
    markers, addMarker, removeMarker, clearAll,

    vesselPositions, vesselsLoading,
    eezData, eezLoading,
    bordersData, bordersLoading,
    portsData, portsLoading,
    conflictData, conflictLoading,
    cablesData, cablesLoading,
    pipelinesData, pipelinesLoading,
    militaryBases, basesLoading,

    startTime, stopTime
  };
}
