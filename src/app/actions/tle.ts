'use server';

import { SATELLITE_GROUPS } from '@/lib/satellite-groups';
import type { SatelliteGroup } from '@/lib/satellite-groups';
import { fetchWithFallback } from '@/lib/fetch-with-fallback';

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

const CORE_GROUPS = ['active', 'stations'] as const;

async function fetchGroupTLE(group: string): Promise<TLESatellite[]> {
  const base =
    process.env.CELESTRAK_BASE_URL?.replace(/\/+$/, '') ?? 'https://celestrak.org';
  const path = `/NORAD/elements/gp.php?GROUP=${encodeURIComponent(group)}&FORMAT=json`;
  const urls = [
    `${base}${path}`,
    `https://celestrak.org${path}`,
    `https://celestrak.com${path}`,
    `https://www.celestrak.com${path}`,
  ];

  const result = await fetchWithFallback(
    urls,
    {
      next: { revalidate: 7200 },
    },
    {
      timeoutMs: 3000,
      retriesPerUrl: 0,
      headers: {
        'User-Agent': 'ATOM-Geopolitics-Dashboard/1.0',
        Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
      },
    }
  );
  
  if (!result.response) {
    console.warn(
      `[TLE] Failed to fetch group "${group}": ${result.errors
        .map((e) => `${e.url}: ${e.error instanceof Error ? e.error.message : String(e.error)}`)
        .join(' | ')}`
    );
    return [];
  }

  const text = await result.response.text();

  if (text.includes('has not updated') || text.includes('error') || text.includes('limit')) {
    console.warn(`[TLE] Celestrak returned error/rate-limit for group "${group}"`);
    return [];
  }

  return parseJsonTLE(text);
}

function parseJsonTLE(data: string): TLESatellite[] {
  try {
    const json = JSON.parse(data);
    if (!Array.isArray(json)) return [];
    
    return json
      .filter((sat: any) => sat.TLE_LINE1 && sat.TLE_LINE2 && sat.OBJECT_NAME)
      .map((sat: any) => ({
        name: sat.OBJECT_NAME,
        line1: sat.TLE_LINE1,
        line2: sat.TLE_LINE2,
      }));
  } catch (e) {
    console.warn('[TLE] Failed to parse JSON response:', e);
    return parsePlainTLE(data);
  }
}

function parsePlainTLE(data: string): TLESatellite[] {
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
  { name: 'TIANGONG', line1: '1 48274U 21035A   26086.50000000  .00012345  00000-0  21000-3 0  9990', line2: '2 48274  41.4700 120.5000 0004500 280.0000 80.0000 15.62000000100000' },
  { name: 'HUBBLE', line1: '1 20580U 90037B   26086.50000000  .00000800  00000-0  40000-4 0  9990', line2: '2 20580  28.4700 200.0000 0002800 100.0000 260.0000 15.09000000400000' },
  { name: 'TERRA', line1: '1 25994U 99068A   26086.50000000  .00000100  00000-0  30000-4 0  9990', line2: '2 25994  98.2100 120.0000 0001200  90.0000 270.0000 14.57000000300000' },
  { name: 'LANDSAT 9', line1: '1 49260U 21088A   26086.50000000  .00000050  00000-0  20000-4 0  9990', line2: '2 49260  98.2200 130.0000 0001500  85.0000 275.0000 14.57000000200000' },
  { name: 'SENTINEL-2A', line1: '1 40697U 15028A   26086.50000000  .00000060  00000-0  25000-4 0  9990', line2: '2 40697  98.5700 140.0000 0001000  95.0000 265.0000 14.31000000200000' },
  { name: 'GPS BIIR-2', line1: '1 28474U 04045A   26086.50000000  .00000010  00000-0  00000+0 0  9990', line2: '2 28474  55.0400  60.0000 0080000 250.0000 105.0000  2.00563000150000' },
  { name: 'NAVSTAR 79', line1: '1 48859U 21054A   26086.50000000  .00000005  00000-0  00000+0 0  9990', line2: '2 48859  55.1500 300.0000 0010000 200.0000 160.0000  2.00563000100000' },
  { name: 'COSMOS 2564 (GLONASS)', line1: '1 55299U 23015A   26086.50000000 -.00000010  00000-0  00000+0 0  9990', line2: '2 55299  64.8000 180.0000 0010000 270.0000  90.0000  2.13102000050000' },
];

export async function fetchActiveSatellites(): Promise<TLEData> {
  try {
    const results = await Promise.allSettled(
      CORE_GROUPS.map(group => fetchGroupTLE(group))
    );

    const satellites: TLESatellite[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        satellites.push(...result.value);
      }
    }

    const seen = new Set<string>();
    const unique = satellites.filter(sat => {
      if (seen.has(sat.name)) return false;
      seen.add(sat.name);
      return true;
    });

    if (unique.length > 0) {
      console.log(`[TLE] Fetched ${unique.length} satellites from Celestrak`);
      return { satellites: unique, fetchedAt: new Date().toISOString(), source: 'celestrak' };
    }

    console.warn('[TLE] No satellites from Celestrak, using expanded fallback');
    return { satellites: SAMPLE_SATELLITES, fetchedAt: new Date().toISOString(), source: 'fallback' };
  } catch (err) {
    console.error('[TLE] Fatal error fetching satellites:', err);
    return { satellites: SAMPLE_SATELLITES, fetchedAt: new Date().toISOString(), source: 'fallback' };
  }
}

export async function fetchTLEByGroup(group: string): Promise<TLEData> {
  try {
    const satellites = await fetchGroupTLE(group);
    if (satellites.length > 0) {
      return { satellites, fetchedAt: new Date().toISOString(), source: 'celestrak' };
    }
    return { satellites: SAMPLE_SATELLITES, fetchedAt: new Date().toISOString(), source: 'fallback' };
  } catch {
    return { satellites: SAMPLE_SATELLITES, fetchedAt: new Date().toISOString(), source: 'fallback' };
  }
}