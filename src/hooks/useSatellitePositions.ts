"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchActiveSatellites, type TLESatellite } from '@/app/actions/tle';
import { Cartesian3 } from 'cesium';
import { SATELLITE_GROUPS } from '@/lib/satellite-groups';
import { 
  fetchTLEByCategory, 
  propagateSatellite, 
  CACHE_DURATION 
} from '@/lib/satellite-utils';

export interface SatellitePosition {
  id: string;
  name: string;
  position: Cartesian3;
}

export function useSatellitePositions(enabled: boolean = false, selectedGroups: string[] = []) {
  const [positions, setPositions] = useState<SatellitePosition[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const satellitesRef = useRef<TLESatellite[]>([]);

  const updatePositions = useCallback(() => {
    const now = new Date();
    const newPositions: SatellitePosition[] = [];

    for (const sat of satellitesRef.current) {
      const cartesian = propagateSatellite(sat, now);
      if (cartesian) {
        const satId = sat.line1.slice(2, 7).trim() + sat.line1.slice(9, 11).trim();
        newPositions.push({ id: satId, name: sat.name, position: cartesian });
      }
    }

    setPositions(newPositions);
  }, []);

  const fetchSatellites = useCallback(async () => {
    try {
      let satellites: TLESatellite[] = [];

      if (selectedGroups.length > 0) {
        const categories = selectedGroups
          .map(groupId => SATELLITE_GROUPS.find(g => g.id === groupId)?.category)
          .filter((cat): cat is string => Boolean(cat));

        const uniqueCategories = [...new Set(categories)];
        const results = await Promise.all(
          uniqueCategories.map(cat => fetchTLEByCategory(cat))
        );

        satellites = results.flat();
      } else {
        const data = await fetchActiveSatellites();
        satellites = data.satellites;
      }

      satellitesRef.current = satellites;
      updatePositions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    }
  }, [selectedGroups, updatePositions]);

  useEffect(() => {
    if (!enabled) return;

    const init = async () => {
      setLoading(true);
      await fetchSatellites();
      setLoading(false);
    };

    init();

    const interval = setInterval(fetchSatellites, CACHE_DURATION);
    const tick = setInterval(updatePositions, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(tick);
    };
  }, [enabled, fetchSatellites, updatePositions]);

  return { positions, loading, error };
}