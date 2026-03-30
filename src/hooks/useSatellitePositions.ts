import { useState, useEffect, useRef } from 'react';
import { fetchActiveSatellites, type TLESatellite } from '@/app/actions/tle';
import { twoline2satrec, propagate, gstime, eciToGeodetic } from 'satellite.js';
import { Cartesian3 } from 'cesium';

export interface SatellitePosition {
  id: string;
  name: string;
  position: ReturnType<typeof Cartesian3.fromRadians>;
}

export function useSatellitePositions(enabled: boolean = false) {
  const [positions, setPositions] = useState<SatellitePosition[]>([]);
  const [loading, setLoading] = useState(!enabled);
  const [error, setError] = useState<string | null>(null);
  const satellitesRef = useRef<TLESatellite[]>([]);

  const updatePositions = useRef(() => {
    const now = new Date();
    const newPositions: SatellitePosition[] = [];

    for (const sat of satellitesRef.current) {
      try {
        const satrec = twoline2satrec(sat.line1, sat.line2);
        if (satrec.error) {
          continue;
        }
        
        const posVel = propagate(satrec, now);
        
        if (posVel && posVel.position && typeof posVel.position === 'object') {
          const gmst = gstime(now);
          const gd = eciToGeodetic(posVel.position as any, gmst);
          
          const cartesian = Cartesian3.fromRadians(
            gd.longitude,
            gd.latitude,
            (gd.height || 0) * 1000
          );
          
          const satId = sat.line1.slice(2, 7).trim() + sat.line1.slice(9, 11).trim();
          newPositions.push({ id: satId, name: sat.name, position: cartesian });
        }
      } catch (e) {
      }
    }

    setPositions(newPositions);
  });

  useEffect(() => {
    if (!enabled) return;

    const init = async () => {
      try {
        const data = await fetchActiveSatellites();
        satellitesRef.current = data.satellites;
        updatePositions.current();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    };

    init();

    const interval = setInterval(async () => {
      try {
        const data = await fetchActiveSatellites();
        satellitesRef.current = data.satellites;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch');
      }
    }, 2 * 60 * 60 * 1000);

    const tick = setInterval(updatePositions.current, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(tick);
    };
  }, [enabled]);

  return { positions, loading, error };
}