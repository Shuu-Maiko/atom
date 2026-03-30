'use server';

import { SatelliteGroup, SATELLITE_GROUPS } from '@/lib/satellite-groups';

export interface TLESatellite {
  name: string;
  line1: string;
  line2: string;
}

export interface TLEData {
  satellites: TLESatellite[];
  fetchedAt: string;
  source: string;
}

export type { SatelliteGroup };
export { SATELLITE_GROUPS };

const GROUPS: SatelliteGroup[] = SATELLITE_GROUPS.map(g => g.id);

async function fetchTLEFromCelestrak(): Promise<string> {
  const results: string[] = [];
  
  for (const group of GROUPS) {
    try {
      const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=tle`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        if (!text.includes('has not updated')) {
          results.push(text);
        }
      }
    } catch {}
  }
  
  if (results.length === 0) {
    throw new Error('All groups rate-limited');
  }
  
  return results.join('\n');
}

interface CelestrakSatelliteJson {
  OBJECT_NAME: string;
  TLE_LINE1?: string;
  TLE_LINE2?: string;
  MEAN_MOTION?: number;
  ECCENTRICITY?: number;
  INCLINATION?: number;
  RA_OF_ASC_NODE?: number;
  ARG_OF_PERICENTER?: number;
  MEAN_ANOMALY?: number;
}

function generateTLE(sat: CelestrakSatelliteJson): { line1: string; line2: string } | null {
  const { OBJECT_NAME, MEAN_MOTION, ECCENTRICITY, INCLINATION, RA_OF_ASC_NODE, ARG_OF_PERICENTER, MEAN_ANOMALY } = sat;
  
  if (!MEAN_MOTION || !ECCENTRICITY || !INCLINATION || !RA_OF_ASC_NODE || !ARG_OF_PERICENTER || !MEAN_ANOMALY) {
    return null;
  }

  const satnum = OBJECT_NAME?.replace(/\D/g, '').slice(-5) || '00000';
  const epoch = '26086.5'; 
  const ecc = ECCENTRICITY.toFixed(7).replace('.', '');
  const incl = INCLINATION.toFixed(4);
  const raan = RA_OF_ASC_NODE.toFixed(4);
  const argp = ARG_OF_PERICENTER.toFixed(4);
  const ma = MEAN_ANOMALY.toFixed(4);
  const mm = MEAN_MOTION.toFixed(8);
  
  const line1 = `1 ${satnum}U 99999A   ${epoch}  .00000000  00000-0  00000-0 0  9999`;
  const line2 = `2 ${satnum}  ${incl.padStart(8)} ${raan.padStart(8)} ${ecc.padStart(8)} ${argp.padStart(8)} ${ma.padStart(8)} ${mm.padStart(12)}0`;

  return { line1, line2 };
}

function parseTLE(data: string): TLESatellite[] {
  try {
    const json = JSON.parse(data);
    if (Array.isArray(json)) {
      return json.map((sat: CelestrakSatelliteJson) => {
        if (sat.TLE_LINE1 && sat.TLE_LINE2) {
          return { name: sat.OBJECT_NAME, line1: sat.TLE_LINE1, line2: sat.TLE_LINE2 };
        }
        const generated = generateTLE(sat);
        if (generated) {
          return { name: sat.OBJECT_NAME, ...generated };
        }
        return null;
      }).filter(Boolean) as TLESatellite[];
    }
  } catch {}
  
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

const SAMPLE_SATELLITES: TLESatellite[] = [
  { name: 'ISS (ZARYA)', line1: '1 25544U 98067A   26086.48923095  .00011826  00000-0  21445-3 0  9992', line2: '2 25544  51.6400 347.6047 0006692 271.4151 148.3732 15.49815568420258' },
  { name: 'NOAA 19', line1: '1 33591U 09005A   26086.46036519  .00000205  00000-0  14645-4 0  9991', line2: '2 33591  99.1155 243.2337 0013044 226.3797 133.6484 14.13129935423431' },
  { name: 'METEOR M2 3', line1: '1 57166U 23092A   26086.56036519  .00000054  00000-0  31608-5 0  9990', line2: '2 57166  97.4561 147.8539 0010853  15.1234 345.0365 14.88952179423456' },
  { name: 'GOES 18', line1: '1 51810U 22022A   26086.48194259 -.00000068  00000-0  00000+0 0  9990', line2: '2 51810  0.0329  64.6529 0000596 197.5513  74.7856  1.00271016040399' },
];

export async function fetchActiveSatellites(): Promise<TLEData> {
  try {
    const rawData = await fetchTLEFromCelestrak();
    const satellites = parseTLE(rawData);
    
    if (satellites.length === 0) {
      return { satellites: SAMPLE_SATELLITES, fetchedAt: new Date().toISOString(), source: 'fallback' };
    }
    
    return { satellites, fetchedAt: new Date().toISOString(), source: 'celestrak' };
  } catch {
    return { satellites: SAMPLE_SATELLITES, fetchedAt: new Date().toISOString(), source: 'fallback' };
  }
}