"use server";

import { fetchWithFallback } from '@/lib/fetch-with-fallback';

export async function getPortsData() {
  const query = `
    [out:json][timeout:25];
    (
      node["man_made"="port"]["name"];
      node["harbour"="yes"]["name"];
    );
    out body 500;
  `;
  
  const instances = (
    process.env.OVERPASS_INSTANCES ??
    [
      'https://overpass-api.de/api/interpreter',
      'https://lz4.overpass-api.de/api/interpreter',
      'https://overpass.kumi.systems/api/interpreter',
      'https://overpass.openstreetmap.ru/api/interpreter',
    ].join(',')
  )
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const urls = instances.map(
    (base) => `${base.replace(/\/+$/, '')}?data=${encodeURIComponent(query)}`
  );
  
  try {
    const result = await fetchWithFallback(
      urls,
      {
        next: { revalidate: 86400 },
      },
      {
        timeoutMs: 20000,
        retriesPerUrl: 1,
        headers: {
          'User-Agent': 'ATOM-Geopolitics-Dashboard/1.0',
          Accept: 'application/json, */*;q=0.8',
        },
      }
    );

    if (!result.response) {
      throw new Error(
        `Failed to fetch ports data: ${result.errors
          .map((e) => `${e.url}: ${e.error instanceof Error ? e.error.message : String(e.error)}`)
          .join(' | ')}`
      );
    }

    const data = await result.response.json();
    
    const ports = data.elements.map((el: any) => ({
      id: el.id,
      name: el.tags.name,
      lat: el.lat,
      lon: el.lon,
      type: el.tags.man_made === 'port' ? 'port' : 'harbour'
    }));

    const chokepoints = [
      { id: 'choke-suez', name: 'Suez Canal', lat: 30.5852, lon: 32.3364, type: 'chokepoint' },
      { id: 'choke-panama', name: 'Panama Canal', lat: 9.1172, lon: -79.7842, type: 'chokepoint' },
      { id: 'choke-malacca', name: 'Strait of Malacca', lat: 1.43, lon: 102.89, type: 'chokepoint' },
      { id: 'choke-hormuz', name: 'Strait of Hormuz', lat: 26.56, lon: 56.25, type: 'chokepoint' },
      { id: 'choke-gibraltar', name: 'Strait of Gibraltar', lat: 35.95, lon: -5.48, type: 'chokepoint' },
      { id: 'choke-bab-el-mandeb', name: 'Bab el-Mandeb', lat: 12.58, lon: 43.34, type: 'chokepoint' }
    ];

    return [...chokepoints, ...ports];
  } catch (error) {
    console.error('Error fetching ports data:', error);
    return [];
  }
}
