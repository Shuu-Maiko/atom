'use server';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
];

let requestCount = 0;

function getRandomUserAgent(): string {
  const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  requestCount++;
  return ua;
}

interface GeoJSON {
  type: string;
  coordinates: any;
}

interface PlaceData {
  place_id?: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address?: {
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    district?: string;
    county?: string;
    state?: string;
    country?: string;
  };
  boundingbox?: [string, string, string, string];
  geojson?: GeoJSON;
}

export async function getAreaFromCoords(lat: number, lon: number): Promise<PlaceData> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&polygon_geojson=1`,
    { 
      headers: { 
        'User-Agent': getRandomUserAgent(),
        'Accept-Language': 'en-US,en;q=0.9',
      },
    }
  );
  
  if (res.status === 429) {
    await new Promise(r => setTimeout(r, 2000));
    const retryRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&polygon_geojson=1`,
      { 
        headers: { 
          'User-Agent': getRandomUserAgent(),
        },
      }
    );
    if (!retryRes.ok) {
      throw new Error(`Failed to fetch: ${retryRes.status}`);
    }
    return retryRes.json();
  }
  
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }
  return res.json();
}

export async function searchPlaces(query: string): Promise<PlaceData[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
    { headers: { 'User-Agent': getRandomUserAgent() } }
  );
  
  if (res.status === 429) {
    await new Promise(r => setTimeout(r, 2000));
    const retryRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
      { headers: { 'User-Agent': getRandomUserAgent() } }
    );
    if (!retryRes.ok) {
      throw new Error(`Failed to fetch: ${retryRes.status}`);
    }
    return retryRes.json();
  }
  
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }
  return res.json();
}
