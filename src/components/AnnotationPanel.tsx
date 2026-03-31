"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Pencil, 
  MapPin, 
  Maximize2, 
  Save, 
  Download,
  Trash2,
  X
} from 'lucide-react';
import { MapAnnotation } from '@/types/annotations.d';

interface AnnotationPanelProps {
  active: boolean;
  annotations: MapAnnotation[];
  onStartDrawing: (type: MapAnnotation['type']) => void;
  onSaveWorkspace: () => void;
  onExport: () => void;
  onClear: () => void;
  onClose: () => void;
}

export function AnnotationPanel({ 
  active, 
  annotations, 
  onStartDrawing, 
  onSaveWorkspace, 
  onExport, 
  onClear, 
  onClose 
}: AnnotationPanelProps) {
  if (!active) return null;

  return (
    <div className="fixed top-24 right-8 z-50 w-64 animate-in slide-in-from-right-4 duration-300">
      <Card className="bg-neutral-900/90 backdrop-blur-md border-white/10 text-white shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
          <CardTitle className="text-sm font-bold uppercase tracking-tighter flex items-center gap-2">
            <Pencil className="h-4 w-4 text-cyan-500" /> Analyst Workspace
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="p-4 pt-2 flex flex-col gap-4">
          {/* tools */}
          <div className="grid grid-cols-2 gap-2">
             <Button 
                variant="outline" 
                className="flex flex-col h-16 gap-1 border-white/5 bg-white/5 hover:bg-white/10 hover:border-cyan-500/50 transition-all group"
                onClick={() => onStartDrawing('point')}
              >
                <MapPin className="h-4 w-4 text-white/50 group-hover:text-cyan-400" />
                <span className="text-[10px] text-white/40 group-hover:text-white">Add Point</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col h-16 gap-1 border-white/5 bg-white/5 hover:bg-white/10 hover:border-cyan-500/50 transition-all group"
                onClick={() => onStartDrawing('line')}
              >
                <Maximize2 className="h-4 w-4 text-white/50 group-hover:text-cyan-400" />
                <span className="text-[10px] text-white/40 group-hover:text-white">Draw Line</span>
              </Button>
          </div>

          <Separator className="bg-white/10" />

          {/* actions */}
          <div className="flex flex-col gap-2">
            <Button variant="secondary" size="sm" className="w-full gap-2 text-xs font-bold" onClick={onSaveWorkspace}>
              <Save className="h-3.5 w-3.5" /> Save Workspace
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="gap-2 text-[10px] bg-white/5 border-white/5 hover:bg-white/10" onClick={onExport}>
                <Download className="h-3 w-3" /> Export
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-[10px] bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20" onClick={onClear}>
                <Trash2 className="h-3 w-3" /> Clear All
              </Button>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* list */}
          <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="text-[10px] uppercase font-bold text-white/30">Recent Markups ({annotations.length})</div>
            {annotations.length === 0 ? (
                <div className="text-[10px] text-white/20 italic">No markups recorded.</div>
            ) : (
                annotations.slice().reverse().map((a) => (
                    <div key={a.id} className="flex items-center justify-between bg-white/5 p-2 rounded-md border border-white/5">
                        <span className="text-[11px] truncate max-w-[150px]">{a.name}</span>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                        </div>
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
