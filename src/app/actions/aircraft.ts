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

async function fetchFromOpenSky(): Promise<AircraftData> {
  const res = await fetch('https://opensky-network.org/api/states/all', {
    cache: 'no-store',
  });

  if (res.status === 429) {
    return { aircraft: [], fetchedAt: new Date().toISOString(), source: 'opensky-rate-limited' };
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  const data = await res.json();
  const states = data.states as OpenSkyState[];

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
}

export async function fetchAircraft(): Promise<AircraftData> {
  return fetchFromOpenSky();
}
