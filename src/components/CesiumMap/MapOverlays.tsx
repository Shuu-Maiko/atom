"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Layers, 
  ChevronDown, 
  Satellite as SatelliteIcon, 
  Plane, 
  Ship, 
  Waves, 
  Map as MapIcon, 
  Anchor, 
  Flame, 
  Activity, 
  Fuel, 
  ShieldAlert, 
  Radio, 
  TrendingUp, 
  Crosshair, 
  ShieldCheck, 
  Pencil,
  MapPin,
  Search,
  RotateCcw,
  X,
  Camera,
  Globe,
  Radar
} from 'lucide-react';

interface MapOverlaysProps {
  state: any;
  interactions: any;
  onCapture: () => void;
}

export function MapOverlays({ state, interactions, onCapture }: MapOverlaysProps) {
  const {
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
    isTacticalActive, setIsTacticalActive,
    setTacticalPoints,
    isScenarioMode, setIsScenarioMode,
    setPendingUnitType,
    isAnnotationMode, setIsAnnotationMode,
    setPendingAnnotationType,
    isAddingMarker, setIsAddingMarker,
    showLayerMenu, setShowLayerMenu,
    selectedPlace,
    setShowSearch,
    vesselPositions,
    pendingUnitType,
    activeImageryType, setActiveImageryType,
  } = state;

  const {
    resetCamera,
    clearSelection
  } = interactions;

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden font-mono text-white">
      {/* sidebar */}
      <div className="absolute top-6 left-6 z-50 flex flex-col gap-px bg-[#050505] border border-white/20 p-px shadow-2xl pointer-events-auto">
        <SidebarTab icon={Search} label="SEARCH" onClick={() => setShowSearch(true)} />
        <SidebarTab icon={Layers} label="LYRS" onClick={() => setShowLayerMenu(!showLayerMenu)} active={showLayerMenu} />
        <SidebarTab icon={Camera} label="CAP" onClick={onCapture} />
        
        {/* r-status */}
        <div className="border-t border-white/10 mt-1 pt-1 flex flex-col gap-px">
          {showSatellites && <RailStatus icon={SatelliteIcon} value="ORB" />}
          {showVessels && <RailStatus icon={Ship} value={vesselPositions?.length || 0} />}
          {showSensors && <RailStatus icon={Radio} value="SIG" />}
        </div>
      </div>

      {/* menu */}
      {showLayerMenu && (
        <div className="absolute top-6 left-[76px] w-[280px] z-[60] pointer-events-auto animate-in slide-in-from-left-2 duration-200">
          <div className="bg-[#050505] border border-white/20 shadow-[0_0_50px_rgba(0,0,0,1)]">
            <div className="p-3 bg-white/10 border-b border-white/20 flex justify-between items-center">
              <span className="text-[11px] font-black text-white tracking-[0.3em]">STRATEGIC_CMD</span>
              <X className="w-3.5 h-3.5 text-white/50 hover:text-white cursor-pointer transition-colors" onClick={() => setShowLayerMenu(false)} />
            </div>
            
            <div className="p-1 space-y-0.5 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* engine */}
              <LayerGroup label="VISUAL_ENGINE" />
              <div className="grid grid-cols-2 gap-px bg-white/10 mb-1 border border-white/10">
                <ImageryButton 
                  label="STREETS" 
                  active={activeImageryType === 'STREETS'} 
                  onClick={() => setActiveImageryType('STREETS')} 
                />
                <ImageryButton 
                  label="SATELLITE" 
                  active={activeImageryType === 'SATELLITE'} 
                  onClick={() => setActiveImageryType('SATELLITE')} 
                />
                <ImageryButton 
                  label="HYBRID" 
                  active={activeImageryType === 'HYBRID'} 
                  onClick={() => setActiveImageryType('HYBRID')} 
                />
                <ImageryButton 
                  label="TACTICAL" 
                  active={activeImageryType === 'TACTICAL'} 
                  onClick={() => setActiveImageryType('TACTICAL')} 
                />
              </div>

              <LayerGroup label="Surveillance" />
              <LayerMenuItem icon={SatelliteIcon} label="SATCON" active={showSatellites} onClick={() => setShowSatellites(!showSatellites)} />
              <LayerMenuItem icon={Plane} label="AVIONICS" active={showAircraft} onClick={() => setShowAircraft(!showAircraft)} />
              <LayerMenuItem icon={Ship} label="MARITIME" active={showVessels} onClick={() => setShowVessels(!showVessels)} />
              <LayerMenuItem icon={Radio} label="SIGINT" active={showSensors} onClick={() => setShowSensors(!showSensors)} />
              
              <LayerGroup label="Geopolitical" />
              <LayerMenuItem icon={Waves} label="EEZ" active={showEEZ} onClick={() => setShowEEZ(!showEEZ)} />
              <LayerMenuItem icon={MapIcon} label="BORDERS" active={showBorders} onClick={() => setShowBorders(!showBorders)} />
              <LayerMenuItem icon={Anchor} label="PORTS" active={showPorts} onClick={() => setShowPorts(!showPorts)} />
              <LayerMenuItem icon={Flame} label="CONFLICT" active={showConflicts} onClick={() => setShowConflicts(!showConflicts)} />
              
              <LayerGroup label="Infrastructure" />
              <LayerMenuItem icon={Activity} label="CABLES" active={showCables} onClick={() => setShowCables(!showCables)} />
              <LayerMenuItem icon={Fuel} label="ENERGY" active={showPipelines} onClick={() => setShowPipelines(!showPipelines)} />
              <LayerMenuItem icon={ShieldAlert} label="ASSETS" active={showMilitaryBases} onClick={() => setShowMilitaryBases(!showMilitaryBases)} />
            </div>
          </div>
        </div>
      )}

      {/* navigation */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <div className="bg-[#050505] border border-white/20 p-px rounded-none flex items-center shadow-2xl">
          <NavButton icon={MapPin} active />
          <NavButton icon={Layers} />
          <NavButton icon={Radio} />
          <NavButton icon={ShieldAlert} />
        </div>
      </div>

      {/* tools */}
      <div className="absolute bottom-10 right-10 z-50 flex flex-col gap-px pointer-events-auto bg-[#050505] border border-white/20 p-px shadow-2xl">
        <button onClick={resetCamera} className="w-12 h-12 flex items-center justify-center hover:bg-white/10 transition-all outline-none">
          <RotateCcw className="w-4 h-4 text-white" />
        </button>
        <button 
          onClick={() => setIsAddingMarker(!isAddingMarker)} 
          className={`w-12 h-12 flex items-center justify-center transition-all outline-none ${isAddingMarker ? 'bg-primary text-black' : 'hover:bg-white/10 text-white'}`}
        >
          <MapPin className="w-4 h-4" />
        </button>
        {selectedPlace && (
          <button onClick={clearSelection} className="w-12 h-12 flex items-center justify-center hover:bg-red-500 text-white bg-red-600/20 transition-all outline-none">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function SidebarTab({ icon: Icon, label, onClick, active = false }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-14 h-14 flex flex-col items-center justify-center gap-1 transition-all outline-none border-b border-white/10 ${active ? 'bg-primary text-black font-black' : 'text-white/60 hover:bg-white/10 hover:text-white font-bold'}`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[9px] tracking-tight leading-none uppercase font-black">{label}</span>
    </button>
  );
}

function RailStatus({ icon: Icon, value, color = "text-primary" }: any) {
  return (
    <div className="w-14 h-14 flex flex-col items-center justify-center gap-0.5 border-b border-white/10 bg-black/40">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-[10px] font-black text-white tracking-widest">{value}</span>
    </div>
  );
}

function LayerGroup({ label }: any) {
  return (
    <div className="px-3 py-2 text-[9px] font-black text-white/40 uppercase tracking-[0.3em] border-b border-white/5 bg-white/5">
      {label}
    </div>
  );
}

function LayerMenuItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 transition-all outline-none border-l-2 ${active ? 'bg-primary/20 border-primary shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.1)]' : 'hover:bg-white/5 border-transparent'}`}
    >
      <div className="flex items-center gap-4">
        <Icon className={`w-4.5 h-4.5 ${active ? 'text-primary' : 'text-white/60'}`} />
        <span className={`text-[11px] font-black tracking-widest uppercase ${active ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>{label}</span>
      </div>
      {active && <div className="w-1.5 h-1.5 bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />}
    </button>
  );
}

function ImageryButton({ label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-primary text-black' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
    >
      {label}
    </button>
  );
}

function NavButton({ icon: Icon, active = false }: any) {
  return (
    <button className={`w-14 h-14 flex items-center justify-center transition-all ${active ? 'bg-primary text-black' : 'text-white/60 hover:text-white hover:bg-white/10'}`}>
      <Icon className="w-6 h-6" />
    </button>
  );
}
