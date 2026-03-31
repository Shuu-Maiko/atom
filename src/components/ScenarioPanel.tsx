"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Shield, 
  Plane, 
  Ship, 
  MapPin,
  X,
  Plus
} from 'lucide-react';
import { ScenarioUnit } from '@/types/geopolitics.d';

interface ScenarioPanelProps {
  active: boolean;
  units: ScenarioUnit[];
  onAddUnit: (type: ScenarioUnit['type']) => void;
  onRemoveUnit: (id: string) => void;
  onClose: () => void;
}

export function ScenarioPanel({ active, units, onAddUnit, onRemoveUnit, onClose }: ScenarioPanelProps) {
  if (!active) return null;

  return (
    <div className="fixed top-24 left-8 z-50 w-64 animate-in slide-in-from-left-4 duration-300">
      <Card className="bg-neutral-900/90 backdrop-blur-md border-white/10 text-white shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-tighter flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-500" /> Scenario Builder
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="p-4 pt-2 flex flex-col gap-4">
          {/* unit-selector */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { type: 'infantry', icon: Users, label: 'Troops' },
              { type: 'air', icon: Plane, label: 'Air' },
              { type: 'naval', icon: Ship, label: 'Naval' },
              { type: 'armor', icon: Shield, label: 'Armor' },
              { type: 'ngo', icon: MapPin, label: 'Aid' },
              { type: 'civ', icon: Users, label: 'Civ' },
            ].map((item) => (
              <Button 
                key={item.type}
                variant="outline" 
                className="flex flex-col h-16 gap-1 border-white/5 bg-white/5 hover:bg-white/10 hover:border-purple-500/50 transition-all group"
                onClick={() => onAddUnit(item.type as any)}
              >
                <item.icon className="h-4 w-4 text-white/50 group-hover:text-purple-400" />
                <span className="text-[10px] text-white/40 group-hover:text-white">{item.label}</span>
              </Button>
            ))}
          </div>

          <Separator className="bg-white/10" />

          {/* deployed-list */}
          <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="text-[10px] uppercase font-bold text-white/30 mb-1">Active Units ({units.length})</div>
            {units.length === 0 ? (
              <div className="text-[10px] text-white/20 italic">No units deployed. Click above to initialize.</div>
            ) : (
              units.map((u) => (
                <div key={u.id} className="flex items-center justify-between bg-white/5 p-2 rounded-md border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className={`w-1 h-3 rounded-full ${u.side === 'hostile' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                    <span className="text-xs font-medium truncate max-w-[100px]">{u.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-white/30 hover:text-red-500" onClick={() => onRemoveUnit(u.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-px w-full ${className}`} />;
}
