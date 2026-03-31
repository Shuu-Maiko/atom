import { TLESatellite } from '@/app/actions/tle';
import { twoline2satrec, propagate, gstime, eciToGeodetic } from 'satellite.js';
import { Cartesian3 } from 'cesium';

export const tleCache = new Map<string, { satellites: TLESatellite[]; timestamp: number }>();
export const CACHE_DURATION = 2 * 60 * 60 * 1000;

export function parseTLE(data: string): TLESatellite[] {
  const lines = data.trim().split('\n');
  const satellites: TLESatellite[] = [];

  for (let i = 0; i < lines.length; i += 3) {
    if (i + 2 >= lines.length) break;

    const name = lines[i].trim();
    const line1 = lines[i + 1]?.trim();
    const line2 = lines[i + 2]?.trim();

    if (name && line1 && line2 && line1.startsWith('1 ') && line2.startsWith('2 ')) {
      satellites.push({ name, line1, line2 });
    }
  }

  return satellites;
}

export async function fetchTLEByCategory(category: string): Promise<TLESatellite[]> {
  const now = Date.now();
  const cached = tleCache.get(category);

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.satellites;
  }

  try {
    const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${category}&FORMAT=json`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch ${category}: ${res.status}`);
    }

    const text = await res.text();

    if (text.includes('has not updated') || text.includes('error') || text.includes('limit')) {
      throw new Error(`No data available for ${category}`);
    }

    let satellites: TLESatellite[];
    try {
      const json = JSON.parse(text);
      satellites = json
        .filter((sat: any) => sat.TLE_LINE1 && sat.TLE_LINE2 && sat.OBJECT_NAME)
        .map((sat: any) => ({
          name: sat.OBJECT_NAME,
          line1: sat.TLE_LINE1,
          line2: sat.TLE_LINE2,
        }));
    } catch {
      satellites = parseTLE(text);
    }

    tleCache.set(category, { satellites, timestamp: now });
    return satellites;
  } catch (err) {
    console.warn(`Failed to fetch TLE for category ${category}:`, err);
    return cached?.satellites || [];
  }
}

export function propagateSatellite(sat: TLESatellite, date: Date): Cartesian3 | null {
  try {
    const satrec = twoline2satrec(sat.line1, sat.line2);
    if (satrec.error) {
      return null;
    }

    const posVel = propagate(satrec, date);

    if (posVel && posVel.position && typeof posVel.position === 'object') {
      const gmst = gstime(date);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gd = eciToGeodetic(posVel.position as any, gmst);

      return Cartesian3.fromRadians(
        gd.longitude,
        gd.latitude,
        (gd.height || 0) * 1000
      );
    }
  } catch (e) {
    return null;
  }
  return null;
}

export function getSatelliteGroupId(name: string): string {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('starlink')) return 'starlink';
  if (lowerName.includes('gps') || lowerName.includes('navstar')) return 'gps-ops';
  if (lowerName.includes('glonass') || lowerName.includes('cosmos') || lowerName.includes('glo-ops')) return 'glo-ops';
  if (lowerName.includes('galileo') || lowerName.includes('gsat')) return 'galileo';
  if (lowerName.includes('beidou') || lowerName.includes('bd') || lowerName.includes('compass')) return 'beidou';

  if (lowerName.includes('iridium')) return 'iridium-NEXT';
  if (lowerName.includes('oneweb')) return 'oneweb';

  if (lowerName.includes('noaa')) return 'noaa';
  if (lowerName.includes('goes')) return 'goes';

  if (lowerName.includes('planet')) return 'planet';
  if (lowerName.includes('landsat') || lowerName.includes('sentinel') || lowerName.includes('worldview') || lowerName.includes('resource')) return 'resource';

  if (lowerName.includes('hubble') || lowerName.includes('hst') || lowerName.includes('xmm') || lowerName.includes('integral') || lowerName.includes('science')) return 'science';

  if (lowerName.includes('amateur') || lowerName.includes('amsat') || lowerName.includes('oscar')) return 'amateur';

  if (lowerName.includes('geodetic') || lowerName.includes('lageos') || lowerName.includes('etalon') || lowerName.includes('geosat')) return 'geodetic';

  if (lowerName.includes('usa') || lowerName.includes('nrol') || lowerName.includes('military') || lowerName.includes('defense') || lowerName.includes('dscovr')) return 'military';

  if (lowerName.includes('iss') || lowerName.includes('tiangong') || lowerName.includes('css') || lowerName.includes('visual')) return 'visual';

  return 'visual';
}
