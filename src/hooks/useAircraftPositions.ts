import { useState, useEffect, useRef } from 'react';
import { fetchAircraft, type Aircraft } from '@/app/actions/aircraft';
import { Cartesian3 } from 'cesium';

export interface AircraftPosition {
  icao24: string;
  callSign: string;
  country: string;
  position: ReturnType<typeof Cartesian3.fromDegrees>;
  altitude: number;
  velocity: number;
  heading: number;
}

export function useAircraftPositions() {
  const [positions, setPositions] = useState<AircraftPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cachedPositions = useRef<AircraftPosition[]>([]);

  useEffect(() => {
    const updatePositions = async () => {
      try {
        const data = await fetchAircraft();
        
        if (data.aircraft.length === 0) {
          setPositions(cachedPositions.current);
          return;
        }
        
        const newPositions: AircraftPosition[] = data.aircraft
          .filter(a => a.latitude && a.longitude && !a.onGround)
          .slice(0, 500)
          .map(a => ({
            icao24: a.icao24,
            callSign: a.callSign,
            country: a.country,
            position: Cartesian3.fromDegrees(a.longitude, a.latitude, a.altitude || 10000),
            altitude: a.altitude,
            velocity: a.velocity,
            heading: a.heading,
          }));
        
        cachedPositions.current = newPositions;
        setPositions(newPositions);
        setError(null);
      } catch (err) {
        setPositions(cachedPositions.current);
      } finally {
        setLoading(false);
      }
    };

    updatePositions();

    const interval = setInterval(updatePositions, 120000);

    return () => clearInterval(interval);
  }, []);

  return { positions, loading, error };
}