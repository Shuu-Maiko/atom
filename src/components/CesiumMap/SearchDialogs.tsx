"use client";

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface SearchDialogsProps {
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: any[];
  handleSearch: (query: string) => void;
  flyToLocation: (lat: number, lon: number) => void;
  
  showMarkerDialog: boolean;
  setShowMarkerDialog: (show: boolean) => void;
  markerName: string;
  setMarkerName: (name: string) => void;
  markerType: string;
  setMarkerType: (type: any) => void;
  addMarker: (name: string, lat: number, lon: number, type: any) => void;
  pendingMarkerCoords: { lat: number; lon: number } | null;
  setPendingMarkerCoords: (coords: any) => void;
}

export function SearchDialogs({
  showSearch, setShowSearch,
  searchQuery, setSearchQuery,
  searchResults,
  handleSearch,
  flyToLocation,
  showMarkerDialog, setShowMarkerDialog,
  markerName, setMarkerName,
  markerType, setMarkerType,
  addMarker,
  pendingMarkerCoords, setPendingMarkerCoords
}: SearchDialogsProps) {
  return (
    <>
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

      <Dialog open={showMarkerDialog} onOpenChange={setShowMarkerDialog}>
        <DialogContent className="sm:max-w-[400px] bg-black/95 border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Create Marker</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/70 mb-2 block">Marker Name</label>
              <Input
                value={markerName}
                onChange={(e) => setMarkerName(e.target.value)}
                placeholder="Enter marker name..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-2 block">Marker Type</label>
              <div className="grid grid-cols-4 gap-2">
                <MarkerTypeButton 
                  type="general" 
                  current={markerType} 
                  color="bg-cyan-400" 
                  activeClass="border-cyan-400 bg-cyan-400/20" 
                  onClick={() => setMarkerType('general')} 
                />
                <MarkerTypeButton 
                  type="military" 
                  current={markerType} 
                  color="bg-red-500" 
                  activeClass="border-red-500 bg-red-500/20" 
                  onClick={() => setMarkerType('military')} 
                />
                <MarkerTypeButton 
                  type="alert" 
                  current={markerType} 
                  color="bg-amber-500" 
                  activeClass="border-amber-500 bg-amber-500/20" 
                  onClick={() => setMarkerType('alert')} 
                />
                <MarkerTypeButton 
                  type="waypoint" 
                  current={markerType} 
                  color="bg-purple-500" 
                  activeClass="border-purple-500 bg-purple-500/20" 
                  onClick={() => setMarkerType('waypoint')} 
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => {
                  setShowMarkerDialog(false);
                  setMarkerName('');
                  setMarkerType('general');
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                onClick={() => {
                  if (pendingMarkerCoords && markerName.trim()) {
                    addMarker(markerName.trim(), pendingMarkerCoords.lat, pendingMarkerCoords.lon, markerType);
                    setMarkerName('');
                    setMarkerType('general');
                    setPendingMarkerCoords(null);
                    setShowMarkerDialog(false);
                  }
                }}
                disabled={!markerName.trim()}
              >
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function MarkerTypeButton({ type, current, color, activeClass, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors ${current === type ? activeClass : 'border-white/20 hover:bg-white/10'}`}
    >
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-xs capitalize">{type}</span>
    </button>
  );
}
