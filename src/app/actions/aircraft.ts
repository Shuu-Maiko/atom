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
}

interface OpenSkyState {
  0: string;  // icao24
  1: string;  // callsign
  2: string;  // country
  3: number;  // time_position
  4: number;  // time_velocity
  5: number;  // longitude
  6: number;  // latitude
  7: number;  // altitude
  8: boolean; // on_ground
  9: number;  // velocity
  10: number; // heading
  11: number; // vertical_rate
}

async function fetchFromOpenSky(): Promise<AircraftData> {
  const res = await fetch('https://opensky-network.org/api/states/all', {
    cache: 'no-store',
  });

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
  };
}

export async function fetchAircraft(): Promise<AircraftData> {
  return fetchFromOpenSky();
}
