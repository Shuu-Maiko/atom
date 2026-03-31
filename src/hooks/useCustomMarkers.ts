'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CustomMarker {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: 'general' | 'military' | 'alert' | 'waypoint';
  createdAt: string;
}

const STORAGE_KEY = 'atom-custom-markers';

export function useCustomMarkers() {
  const [markers, setMarkers] = useState<CustomMarker[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(markers));
    } catch {}
  }, [markers]);

  const addMarker = useCallback((name: string, lat: number, lon: number, type: CustomMarker['type'] = 'general') => {
    const marker: CustomMarker = {
      id: crypto.randomUUID(),
      name,
      lat,
      lon,
      type,
      createdAt: new Date().toISOString(),
    };
    setMarkers(prev => [...prev, marker]);
    return marker;
  }, []);

  const removeMarker = useCallback((id: string) => {
    setMarkers(prev => prev.filter(m => m.id !== id));
  }, []);

  const updateMarker = useCallback((id: string, updates: Partial<Pick<CustomMarker, 'name' | 'type'>>) => {
    setMarkers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const clearAll = useCallback(() => {
    setMarkers([]);
  }, []);

  return { markers, addMarker, removeMarker, updateMarker, clearAll };
}
