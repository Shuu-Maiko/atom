"use client";

import React from 'react';
import { 
  GeoJsonDataSource, 
  Entity, 
  LabelGraphics, 
  CustomDataSource, 
  BillboardGraphics, 
  EllipsoidGraphics, 
  CylinderGraphics 
} from 'resium';
import { 
  Color, 
  Cartesian3, 
  Cartesian2, 
  HorizontalOrigin, 
  VerticalOrigin, 
  HeightReference 
} from 'cesium';
import Satellite from '../Satellite';
import { Aircraft } from '../Aircraft';
import Vessel from '../Vessel';
import CustomMarkers from '../CustomMarkers';
import { TacticalTools } from '../TacticalTools';
import PlaceHighlight from '../PlaceHighlight';
import { getSensorProfile } from '@/lib/weapon-systems';

interface LayerManagerProps {
  state: any;
  militaryClusterOptions: any;
}

export function LayerManager({ state, militaryClusterOptions }: LayerManagerProps) {
  const {
    showSatellites, satelliteCount, selectedSatGroups,
    showAircraft,
    showVessels, showVesselRoutes, filterMilitaryOnly, vesselPositions,
    showEEZ, eezData,
    showBorders, bordersData,
    showPorts, portsData,
    showConflicts, conflictData,
    showCables, cablesData,
    showPipelines, pipelinesData,
    showMilitaryBases, militaryBases,
    showSensors,
    markers,
    startTime, stopTime,
    isTacticalActive, tacticalPoints, setTacticalPoints,
    isScenarioMode, scenarioUnits,
    annotations,
    selectedPlace
  } = state;

  return (
    <>
      {selectedPlace && (selectedPlace.boundingbox || selectedPlace.geojson) && (
        <PlaceHighlight 
          geojson={selectedPlace.geojson} 
          boundingbox={selectedPlace.boundingbox} 
        />
      )}

      {showSatellites && (
        <Satellite 
          maxCount={satelliteCount} 
          selectedGroups={selectedSatGroups.length > 0 ? selectedSatGroups : undefined} 
        />
      )}

      {showAircraft && <Aircraft />}

      {showVessels && (
        <Vessel 
          showRoutes={showVesselRoutes} 
          filterMilitary={filterMilitaryOnly} 
        />
      )}

      {showEEZ && eezData && (
        <GeoJsonDataSource 
          data={eezData} 
          stroke={Color.fromCssColorString('#0ea5e9')} 
          fill={Color.fromCssColorString('#0ea5e9').withAlpha(0.1)} 
        />
      )}

      {showBorders && bordersData && (
        <GeoJsonDataSource 
          data={bordersData} 
          stroke={Color.RED} 
          strokeWidth={2}
        />
      )}

      {showPorts && portsData.map((port: any) => (
        <Entity
          key={port.id}
          position={Cartesian3.fromDegrees(port.lon, port.lat)}
          name={port.name}
          description={`${port.type}: ${port.name}`}
        >
          <BillboardGraphics 
            image="/icons/port.svg"
            width={port.type === 'chokepoint' ? 24 : 18} 
            height={port.type === 'chokepoint' ? 24 : 18} 
            color={port.type === 'chokepoint' ? Color.YELLOW : Color.ORANGE} 
            disableDepthTestDistance={Number.POSITIVE_INFINITY}
          />
          <LabelGraphics 
            text={port.name} 
            font="10px sans-serif" 
            fillColor={Color.WHITE} 
            outlineColor={Color.BLACK} 
            outlineWidth={2}
            horizontalOrigin={HorizontalOrigin.LEFT}
            verticalOrigin={VerticalOrigin.BOTTOM}
            pixelOffset={new Cartesian2(8, -8)}
            showBackground
            backgroundColor={new Color(0, 0, 0, 0.5)}
            heightReference={HeightReference.CLAMP_TO_GROUND}
          />
        </Entity>
      ))}

      {showConflicts && conflictData && (
        <GeoJsonDataSource 
          data={conflictData} 
          markerColor={Color.RED} 
          markerSize={15}
        />
      )}

      {showCables && cablesData && (
        <GeoJsonDataSource 
          data={cablesData} 
          stroke={Color.fromCssColorString('#22d3ee')} 
          strokeWidth={2}
        />
      )}

      {showPipelines && pipelinesData && (
        <GeoJsonDataSource 
          data={pipelinesData} 
          stroke={Color.fromCssColorString('#f97316')} 
          strokeWidth={3}
        />
      )}

      {showMilitaryBases && (
        <CustomDataSource name="militaryBases" clustering={militaryClusterOptions}>
          {militaryBases.map((base: any) => (
            <Entity
              key={base.id}
              position={Cartesian3.fromDegrees(base.lon, base.lat)}
              name={base.name}
              description={`Type: ${base.type}<br/>Country: ${base.country}`}
            >
              <BillboardGraphics 
                image="/icons/military-base.svg" 
                width={24} 
                height={24} 
                verticalOrigin={VerticalOrigin.BOTTOM}
                disableDepthTestDistance={Number.POSITIVE_INFINITY}
              />
            </Entity>
          ))}
        </CustomDataSource>
      )}

      {showSensors && showMilitaryBases && militaryBases.map((base: any) => {
        const profile = getSensorProfile(base.type);
        if (!profile) return null;
        
        return (
          <Entity
            key={`sensor-${base.id}`}
            position={Cartesian3.fromDegrees(base.lon, base.lat)}
          >
            {profile.type === 'radar' ? (
              <EllipsoidGraphics 
                radii={new Cartesian3(profile.range, profile.range, profile.range)} 
                fill={true} 
                material={Color.fromCssColorString('#10b981').withAlpha(0.15)} 
                outline={true} 
                outlineColor={Color.fromCssColorString('#10b981').withAlpha(0.5)} 
              />
            ) : (
              <CylinderGraphics 
                length={profile.range * 0.5} 
                topRadius={profile.range} 
                bottomRadius={profile.range} 
                material={Color.fromCssColorString('#ef4444').withAlpha(0.15)} 
                outline={true} 
                outlineColor={Color.fromCssColorString('#ef4444').withAlpha(0.5)} 
              />
            )}
          </Entity>
        );
      })}

      <CustomMarkers markers={markers} />

      <TacticalTools 
        active={isTacticalActive} 
        selectedPoints={tacticalPoints} 
        onPointSelected={(p) => setTacticalPoints((prev: any) => [...prev, p])} 
      />

      {isScenarioMode && scenarioUnits.map((u: any) => (
        <Entity
          key={u.id}
          position={Cartesian3.fromDegrees(u.lon, u.lat)}
          name={u.name}
          description={u.description || `Tactical Unit: ${u.type}`}
        >
          <BillboardGraphics 
            image="/icons/tactical-unit.svg"
            width={24} 
            height={24} 
            color={u.side === 'hostile' ? Color.RED : Color.LIME} 
            disableDepthTestDistance={Number.POSITIVE_INFINITY}
          />
          <LabelGraphics text={u.name} font="10px Inter" verticalOrigin={VerticalOrigin.BOTTOM} pixelOffset={new Cartesian2(0, -15)} />
        </Entity>
      ))}

      {annotations.map((a: any) => (
        <Entity
          key={a.id}
          position={Cartesian3.fromDegrees(a.positions[0].lon, a.positions[0].lat)}
          name={a.name}
        >
          {a.type === 'point' ? (
            <BillboardGraphics 
              image="/icons/tactical-unit.svg"
              width={20} 
              height={20} 
              color={Color.fromCssColorString(a.color)} 
              disableDepthTestDistance={Number.POSITIVE_INFINITY}
            />
          ) : null}
          <LabelGraphics text={a.name} font="10px Inter" verticalOrigin={VerticalOrigin.BOTTOM} pixelOffset={new Cartesian2(0, -10)} />
        </Entity>
      ))}
    </>
  );
}
