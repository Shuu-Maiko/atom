"use client";

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { 
  Settings2, 
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
  Trash2
} from 'lucide-react';
import { SATELLITE_GROUPS } from '@/lib/satellite-groups';
import { CustomMarker } from '@/hooks/useCustomMarkers';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: any;
}

export function SettingsDialog({ open, onOpenChange, state }: SettingsDialogProps) {
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
    satelliteCount, setSatelliteCount,
    selectedSatGroups, setSelectedSatGroups,
    showVesselRoutes, setShowVesselRoutes,
    filterMilitaryOnly, setFilterMilitaryOnly,
    markers, removeMarker, clearAll
  } = state;

  const toggleSatGroup = (groupId: string) => {
    setSelectedSatGroups((prev: string[]) => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onOpenChange(true)}
        className="bg-neutral-900/95 border-neutral-700 text-white hover:bg-neutral-800 shadow-lg"
        title="Settings"
      >
        <Settings2 className="w-4 h-4" />
      </Button>
      <DialogContent className="sm:max-w-[500px] bg-black/95 border-white/20 text-white max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Layer Settings</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <Tabs defaultValue="layers" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10">
              <TabsTrigger value="layers" className="text-white data-[state=active]:bg-white/20">Layers</TabsTrigger>
              <TabsTrigger value="satellites" className="text-white data-[state=active]:bg-white/20">Satellites</TabsTrigger>
              <TabsTrigger value="vessels" className="text-white data-[state=active]:bg-white/20">Vessels</TabsTrigger>
              <TabsTrigger value="markers" className="text-white data-[state=active]:bg-white/20">Markers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="layers" className="space-y-4 mt-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-white/40">Visual Engine</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {['STREETS', 'SATELLITE', 'HYBRID', 'TACTICAL'].map((type) => (
                      <Button
                        key={type}
                        variant="outline"
                        size="sm"
                        className={`text-[9px] font-bold tracking-widest h-8 rounded-none transition-all ${state.activeImageryType === type ? 'bg-primary text-black border-primary' : 'bg-white/5 border-white/10 text-white/50 hover:text-white'}`}
                        onClick={() => state.setActiveImageryType(type)}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-6 space-y-4">
                  <LayerToggle 
                    icon={SatelliteIcon} 
                    label="Satellites" 
                    desc="Track orbiting satellites" 
                    color="text-cyan-400" 
                    checked={showSatellites} 
                    onCheckedChange={setShowSatellites} 
                  />
                  <Separator className="bg-white/10" />
                  <LayerToggle 
                    icon={Plane} 
                    label="Aircraft" 
                    desc="Live aircraft positions" 
                    color="text-yellow-400" 
                    checked={showAircraft} 
                    onCheckedChange={setShowAircraft} 
                  />
                  <Separator className="bg-white/10" />
                  <LayerToggle 
                    icon={Ship} 
                    label="Vessels" 
                    desc="Ship and boat tracking" 
                    color="text-blue-400" 
                    checked={showVessels} 
                    onCheckedChange={setShowVessels} 
                  />
                  <Separator className="bg-white/10" />
                  <LayerToggle 
                    icon={Waves} 
                    label="EEZ Boundaries" 
                    desc="Exclusive Economic Zones" 
                    color="text-cyan-500" 
                    checked={showEEZ} 
                    onCheckedChange={setShowEEZ} 
                  />
                  <Separator className="bg-white/10" />
                  <LayerToggle 
                    icon={MapIcon} 
                    label="International Borders" 
                    desc="Disputed/De Facto boundaries" 
                    color="text-red-500" 
                    checked={showBorders} 
                    onCheckedChange={setShowBorders} 
                  />
                  <Separator className="bg-white/10" />
                  <LayerToggle 
                    icon={Anchor} 
                    label="Ports & Chokepoints" 
                    desc="Strategic maritime infrastructure" 
                    color="text-orange-500" 
                    checked={showPorts} 
                    onCheckedChange={setShowPorts} 
                  />
                  <Separator className="bg-white/10" />
                  <LayerToggle 
                    icon={Flame} 
                    label="Conflict & Military Events" 
                    desc="Real-time alerts via GDELT" 
                    color="text-red-600" 
                    checked={showConflicts} 
                    onCheckedChange={setShowConflicts} 
                  />
                  <Separator className="bg-white/10" />
                  <LayerToggle 
                    icon={Activity} 
                    label="Submarine Cables" 
                    desc="Global fiber-optic backbone" 
                    color="text-cyan-400" 
                    checked={showCables} 
                    onCheckedChange={setShowCables} 
                  />
                  <Separator className="bg-white/10" />
                  <LayerToggle 
                    icon={Fuel} 
                    label="Oil/Gas Pipelines" 
                    desc="Global energy infrastructure" 
                    color="text-orange-500" 
                    checked={showPipelines} 
                    onCheckedChange={setShowPipelines} 
                  />
                  <Separator className="bg-white/10" />
                  <LayerToggle 
                    icon={ShieldAlert} 
                    label="Military Installations" 
                    desc="Global bases and fortifications" 
                    color="text-red-500" 
                    checked={showMilitaryBases} 
                    onCheckedChange={setShowMilitaryBases} 
                  />
                  <Separator className="bg-white/10" />
                  <LayerToggle 
                    icon={Radio} 
                    label="Signal & Sensor Domain" 
                    desc="Radar and EW coverage envelopes" 
                    color="text-emerald-500" 
                    checked={showSensors} 
                    onCheckedChange={setShowSensors} 
                  />
                  <Separator className="bg-white/10" />
                  <LayerToggle 
                    icon={TrendingUp} 
                    label="Economic Soft-Power" 
                    desc="FDI hotspots and resource influence" 
                    color="text-cyan-400" 
                    checked={showEconomy} 
                    onCheckedChange={setShowEconomy} 
                  />
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Crosshair className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-medium">Tactical Operations</p>
                        <p className="text-xs text-white/50">Point-to-point Line of Sight (LOS)</p>
                      </div>
                    </div>
                    <Switch 
                      checked={isTacticalActive} 
                      onCheckedChange={(val) => {
                        setIsTacticalActive(val);
                        if (!val) setTacticalPoints([]);
                      }} 
                    />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-indigo-500" />
                      <div>
                        <p className="font-medium">Wargaming Simulation</p>
                        <p className="text-xs text-white/50">Custom scenario builder and unit placement</p>
                      </div>
                    </div>
                    <Switch 
                      checked={isScenarioMode} 
                      onCheckedChange={(val) => {
                        setIsScenarioMode(val);
                        if (!val) setPendingUnitType(null);
                      }} 
                    />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Pencil className="w-5 h-5 text-cyan-500" />
                      <div>
                        <p className="font-medium">Analyst Workspace</p>
                        <p className="text-xs text-white/50">Markup, annotate, and export assessments</p>
                      </div>
                    </div>
                    <Switch 
                      checked={isAnnotationMode} 
                      onCheckedChange={(val) => {
                        setIsAnnotationMode(val);
                        if (!val) setPendingAnnotationType(null);
                      }} 
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="satellites" className="space-y-4 mt-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-sm">Satellite Count</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Slider
                      value={[satelliteCount]}
                      onValueChange={(value) => setSatelliteCount((value as number[])[0])}
                      min={50}
                      max={500}
                      step={50}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-white/40 font-mono">
                      <span>50</span>
                      <span>{satelliteCount} UNITS</span>
                      <span>500</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-sm">Strategic Groups</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {SATELLITE_GROUPS.map(group => (
                      <Badge 
                        key={group.id}
                        variant="outline" 
                        className={`cursor-pointer transition-all ${selectedSatGroups.includes(group.id) ? 'bg-cyan-500/20 border-cyan-500 text-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                        onClick={() => toggleSatGroup(group.id)}
                      >
                        {group.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/30 italic mt-2">
                    * Selecting a group filters the visualization to focus on specific mission profiles.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vessels" className="space-y-4 mt-4">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Primary Routes</p>
                      <p className="text-xs text-white/50">Display historical transit corridors</p>
                    </div>
                    <Switch checked={showVesselRoutes} onCheckedChange={setShowVesselRoutes} />
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Military Only</p>
                      <p className="text-xs text-white/50">Filter for naval and guard vessels</p>
                    </div>
                    <Switch checked={filterMilitaryOnly} onCheckedChange={setFilterMilitaryOnly} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="markers" className="space-y-4 mt-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">User Markups</CardTitle>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={clearAll}>
                    CLEAR ALL
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {markers.length === 0 ? (
                      <p className="text-xs text-white/30 italic text-center py-4">No custom markers placed.</p>
                    ) : (
                      markers.map((marker: CustomMarker) => (
                        <div key={marker.id} className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
                          <div>
                            <p className="text-xs font-medium">{marker.name}</p>
                            <p className="text-[10px] text-white/40 font-mono">
                              {marker.lat.toFixed(4)}, {marker.lon.toFixed(4)}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-white/30 hover:text-red-500" onClick={() => removeMarker(marker.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function LayerToggle({ icon: Icon, label, desc, color, checked, onCheckedChange }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-xs text-white/50">{desc}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function Badge({ children, variant, className, onClick }: any) {
    return (
        <span 
            className={`px-2 py-0.5 rounded-full text-[10px] border ${className}`}
            onClick={onClick}
        >
            {children}
        </span>
    )
}
