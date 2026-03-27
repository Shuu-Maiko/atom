import { useState, useEffect, useRef } from 'react';
import { fetchActiveSatellites, type TLESatellite } from '@/app/actions/tle';
import { twoline2satrec, propagate, gstime, eciToGeodetic } from 'satellite.js';
import { Cartesian3 } from 'cesium';

export interface SatellitePosition {
  name: string;
  position: ReturnType<typeof Cartesian3.fromRadians>;
}

export function useSatellitePositions() {
  const [positions, setPositions] = useState<SatellitePosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const satellitesRef = useRef<TLESatellite[]>([]);

  const updatePositions = useRef(() => {
    const now = new Date();
    const newPositions: SatellitePosition[] = [];

    for (const sat of satellitesRef.current) {
      try {
        const satrec = twoline2satrec(sat.line1, sat.line2);
        if (satrec.error) {
          console.warn('TLE error for', sat.name, satrec.error);
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
          
          newPositions.push({ name: sat.name, position: cartesian });
        }
      } catch (e) {
        console.error('Error processing', sat.name, e);
      }
    }

    setPositions(newPositions);
  });

  useEffect(() => {
    fetchActiveSatellites()
      .then(data => {
        satellitesRef.current = data.satellites;
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to fetch'))
      .finally(() => setLoading(false));

    updatePositions.current();

    const interval = setInterval(() => {
      fetchActiveSatellites()
        .then(data => {
          satellitesRef.current = data.satellites;
        })
        .catch(err => setError(err instanceof Error ? err.message : 'Failed to fetch'));
    }, 2 * 60 * 60 * 1000);

    const tick = setInterval(updatePositions.current, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(tick);
    };
  }, []);

  return { positions, loading, error };
}