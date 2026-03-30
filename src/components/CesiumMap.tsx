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
import { getAreaFromCoords, searchPlaces } from '@/app/actions/geocode';
import { Viewer as ResiumViewer, ImageryLayer, CesiumComponentRef } from 'resium';
import Satellite from './Satalite';
import { Aircraft } from './Aircraft';
import Vessel from './Vessel';
import { useVesselPositions } from '@/hooks/useVesselPositions';
import PlaceInfo from './PlaceInfo';
import PlaceHighlight from './PlaceHighlight';
import { Layers, Plane, Satellite as SatelliteIcon, Ship, RotateCcw, X, MapPin, Search, Crosshair, Settings2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { SATELLITE_GROUPS } from '@/lib/satellite-groups';
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
  const [showVessels, setShowVessels] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedSatGroups, setSelectedSatGroups] = useState<string[]>([]);
  const [satelliteCount, setSatelliteCount] = useState(150);
  const [filterMilitaryOnly, setFilterMilitaryOnly] = useState(false);
  const [showVesselRoutes, setShowVesselRoutes] = useState(false);
  
  const { positions: vesselPositions, loading: vesselsLoading } = useVesselPositions(showVessels);

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

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchPlaces(query);
      setSearchResults(results);
    } catch (err) {
      setSearchResults([]);
    }
  }, []);

  const flyToLocation = useCallback((lat: number, lon: number) => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;
    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(lon, lat, 500000),
      duration: 2,
    });
    setShowSearch(false);
  }, []);

  const toggleSatGroup = useCallback((groupId: string) => {
    setSelectedSatGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
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
        {showSatellites && <Satellite maxCount={satelliteCount} selectedGroups={selectedSatGroups.length > 0 ? selectedSatGroups : undefined} />}
        {showAircraft && <Aircraft />}
        {showVessels && <Vessel showRoutes={showVesselRoutes} filterMilitary={filterMilitaryOnly} />}
      </ResiumViewer>

      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="sm:max-w-[425px] bg-black/95 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Search Location</DialogTitle>
          </DialogHeader>
          <Command className="bg-transparent">
            <CommandInput 
              placeholder="Search for a place..." 
              value={searchQuery}
              onValueChange={(value) => {
                setSearchQuery(value);
                handleSearch(value);
              }}
              className="text-white placeholder:text-white/50"
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {searchResults.map((place) => (
                  <CommandItem
                    key={place.place_id}
                    onSelect={() => flyToLocation(parseFloat(place.lat), parseFloat(place.lon))}
                    className="text-white hover:bg-white/10 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 mr-2 text-cyan-400" />
                    <div className="flex flex-col">
                      <span className="font-medium">{place.display_name}</span>
                      <span className="text-xs text-white/50">{place.type}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowSearch(true)}
          className="bg-neutral-900/95 border-neutral-700 text-white hover:bg-neutral-800 shadow-lg"
          title="Search Location"
        >
          <Search className="w-4 h-4" />
        </Button>

        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettings(true)}
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
                <TabsList className="grid w-full grid-cols-3 bg-white/10">
                  <TabsTrigger value="layers" className="text-white data-[state=active]:bg-white/20">Layers</TabsTrigger>
                  <TabsTrigger value="satellites" className="text-white data-[state=active]:bg-white/20">Satellites</TabsTrigger>
                  <TabsTrigger value="vessels" className="text-white data-[state=active]:bg-white/20">Vessels</TabsTrigger>
                </TabsList>
                
                <TabsContent value="layers" className="space-y-4 mt-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <SatelliteIcon className="w-5 h-5 text-cyan-400" />
                          <div>
                            <p className="font-medium">Satellites</p>
                            <p className="text-xs text-white/50">Track orbiting satellites</p>
                          </div>
                        </div>
                        <Switch checked={showSatellites} onCheckedChange={setShowSatellites} />
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Plane className="w-5 h-5 text-yellow-400" />
                          <div>
                            <p className="font-medium">Aircraft</p>
                            <p className="text-xs text-white/50">Live aircraft positions</p>
                          </div>
                        </div>
                        <Switch checked={showAircraft} onCheckedChange={setShowAircraft} />
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Ship className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="font-medium">Vessels</p>
                            <p className="text-xs text-white/50">Ship and boat tracking</p>
                          </div>
                        </div>
                        <Switch checked={showVessels} onCheckedChange={setShowVessels} />
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
                        <p className="text-xs text-white/50 text-right">{satelliteCount} satellites</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-sm">Filter by Group</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {SATELLITE_GROUPS.map((group) => (
                        <div key={group.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: group.color }}
                            />
                            <span className="text-sm">{group.name}</span>
                          </div>
                          <Switch
                            checked={selectedSatGroups.includes(group.id)}
                            onCheckedChange={() => toggleSatGroup(group.id)}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="vessels" className="space-y-4 mt-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Military Only</p>
                          <p className="text-xs text-white/50">Show only military vessels</p>
                        </div>
                        <Switch checked={filterMilitaryOnly} onCheckedChange={setFilterMilitaryOnly} />
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Show Routes</p>
                          <p className="text-xs text-white/50">Display vessel course lines</p>
                        </div>
                        <Switch checked={showVesselRoutes} onCheckedChange={setShowVesselRoutes} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="bg-neutral-900/95 border-neutral-700 text-white hover:bg-neutral-800 shadow-lg"
            title="Toggle Layers"
          >
            <Layers className="w-4 h-4 mr-2" />
            <span className="text-sm">Layers</span>
            <ChevronDown className={`w-3 h-3 ml-2 transition-transform ${showLayerMenu ? 'rotate-180' : ''}`} />
          </Button>
          
          {showLayerMenu && (
            <Card className="absolute top-full right-0 mt-2 w-56 bg-neutral-900/95 border-neutral-700 shadow-xl">
              <CardContent className="p-2 space-y-1">
                <button
                  onClick={() => { setShowSatellites(!showSatellites); }}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/10 transition-colors rounded-md text-white"
                >
                  <div className="flex items-center gap-2">
                    <SatelliteIcon className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm">Satellites</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${showSatellites ? 'bg-cyan-400' : 'bg-white/20'}`} />
                </button>
                <button
                  onClick={() => { setShowAircraft(!showAircraft); }}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/10 transition-colors rounded-md text-white"
                >
                  <div className="flex items-center gap-2">
                    <Plane className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm">Aircraft</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${showAircraft ? 'bg-yellow-400' : 'bg-white/20'}`} />
                </button>
                <button
                  onClick={() => { setShowVessels(!showVessels); }}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/10 transition-colors rounded-md text-white"
                >
                  <div className="flex items-center gap-2">
                    <Ship className="w-4 h-4 text-blue-400" />
                    <span className="text-sm">Vessels</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${showVessels ? 'bg-blue-400' : 'bg-white/20'}`} />
                </button>
              </CardContent>
            </Card>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={resetCamera}
          className="bg-neutral-900/95 border-neutral-700 text-white hover:bg-neutral-800 shadow-lg"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        
        {selectedPlace && (
          <Button
            variant="outline"
            size="icon"
            onClick={clearSelection}
            className="bg-neutral-900/95 border-neutral-700 text-white hover:bg-neutral-800 shadow-lg"
            title="Clear Selection"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 flex-wrap">
        {showAircraft && (
          <Badge variant="outline" className="bg-neutral-900/95 border-yellow-500/50 text-white gap-2 px-3 py-1.5 shadow-lg">
            <Plane className="w-3.5 h-3.5 text-yellow-400" />
            <span>Aircraft Active</span>
          </Badge>
        )}
        {showSatellites && (
          <Badge variant="outline" className="bg-neutral-900/95 border-cyan-500/50 text-white gap-2 px-3 py-1.5 shadow-lg">
            <SatelliteIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Satellites ({satelliteCount})</span>
          </Badge>
        )}
        {showVessels && (
          <Badge variant="outline" className="bg-neutral-900/95 border-blue-500/50 text-white gap-2 px-3 py-1.5 shadow-lg">
            <Ship className="w-3.5 h-3.5 text-blue-400" />
            <span>Vessels: {vesselsLoading ? 'Loading...' : vesselPositions.length} {filterMilitaryOnly ? '(Military)' : ''}</span>
          </Badge>
        )}
        {selectedSatGroups.length > 0 && (
          <Badge variant="outline" className="bg-neutral-900/95 border-purple-500/50 text-white gap-2 px-3 py-1.5 shadow-lg">
            <Crosshair className="w-3.5 h-3.5 text-purple-400" />
            <span>{selectedSatGroups.length} Groups</span>
          </Badge>
        )}
      </div>

      {selectedPlace && (
        <PlaceInfo place={selectedPlace} onClose={() => setSelectedPlace(null)} />
      )}
      
      {showVessels && (
        <div className="absolute bottom-20 left-4 z-10">
          <Card className="bg-neutral-900/95 border-neutral-700 text-white p-3 shadow-lg">
            <CardContent className="p-0 space-y-2">
              <p className="text-xs font-mono text-green-400">● Vessel Layer Active</p>
              <p className="text-xs font-mono">Count: {vesselPositions.length}</p>
              <p className="text-xs font-mono">Loading: {vesselsLoading ? 'Yes' : 'No'}</p>
              {vesselPositions.length > 0 && (
                <>
                  <p className="text-xs font-mono text-white/70">First vessel:</p>
                  <p className="text-xs font-mono text-cyan-400">{vesselPositions[0]?.name}</p>
                  <p className="text-xs font-mono text-white/50">Lat: {vesselPositions[0]?.latitude?.toFixed(4) || 'N/A'}</p>
                  <p className="text-xs font-mono text-white/50">Lon: {vesselPositions[0]?.longitude?.toFixed(4) || 'N/A'}</p>
                </>
              )}
              {vesselPositions.length === 0 && !vesselsLoading && (
                <p className="text-xs font-mono text-yellow-400">
                  No API key or waiting for data...
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
