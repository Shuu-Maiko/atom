'use server';

export interface Aircraft {
  icao24: string;
  callSign: string;
  country: string;
  longitude: number;
  latitude: number;
  altitude: number;
  velocity: number;
  heading: number;
  verticalRate: number;
  onGround: boolean;
}

export interface AircraftData {
  aircraft: Aircraft[];
  fetchedAt: string;
  source: string;
}

interface OpenSkyState {
  0: string;
  1: string;
  2: string;
  3: number;
  4: number;
  5: number;
  6: number;
  7: number;
  8: boolean;
  9: number;
  10: number;
  11: number;
}

const SAMPLE_AIRCRAFT: Aircraft[] = [
  { icao24: "a8b9f1", callSign: "AFR044", country: "France", longitude: 2.555, latitude: 49.008, altitude: 8500, velocity: 230, heading: 250, verticalRate: 0, onGround: false },
  { icao24: "c0fbaf", callSign: "ACA877", country: "Canada", longitude: -79.624, latitude: 43.677, altitude: 10500, velocity: 245, heading: 180, verticalRate: -5, onGround: false },
  { icao24: "a0d1b3", callSign: "DAL15", country: "United States", longitude: -84.427, latitude: 33.640, altitude: 2000, velocity: 150, heading: 90, verticalRate: 10, onGround: false },
  { icao24: "400492", callSign: "BAW112", country: "United Kingdom", longitude: -0.461, latitude: 51.470, altitude: 12000, velocity: 260, heading: 85, verticalRate: 0, onGround: false }
];

async function fetchFromOpenSky(): Promise<AircraftData> {
  try {
    const res = await fetch('https://opensky-network.org/api/states/all', {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.warn(`OpenSky fetch failed: ${res.status}. Falling back to sample aircraft.`);
      return { aircraft: SAMPLE_AIRCRAFT, fetchedAt: new Date().toISOString(), source: 'fallback' };
    }

    const data = await res.json();
    const states = data.states as OpenSkyState[] || [];

    if (!states || states.length === 0) {
      console.warn('OpenSky returned empty states. Falling back to sample aircraft.');
      return { aircraft: SAMPLE_AIRCRAFT, fetchedAt: new Date().toISOString(), source: 'fallback' };
    }

    const aircraft: Aircraft[] = states
      .filter(s => s[5] !== null && s[6] !== null && s[7] !== null)
      .map(s => ({
        icao24: s[0],
        callSign: s[1]?.trim() || 'Unknown',
        country: s[2] || 'Unknown',
        longitude: s[5],
        latitude: s[6],
        altitude: s[7] || 0,
        velocity: s[9] || 0,
        heading: s[10] || 0,
        verticalRate: s[11] || 0,
        onGround: s[8] || false,
      }));

    return {
      aircraft,
      fetchedAt: new Date().toISOString(),
      source: 'opensky',
    };
  } catch (err) {
    console.warn('OpenSky fetch failed or timed out. Falling back to sample aircraft.');
    return { aircraft: SAMPLE_AIRCRAFT, fetchedAt: new Date().toISOString(), source: 'fallback' };
  }
}

export async function fetchAircraft(): Promise<AircraftData> {
  return fetchFromOpenSky();
}
