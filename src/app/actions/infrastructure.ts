"use server";

import { z } from 'zod';
import { fetchWithFallback } from '@/lib/fetch-with-fallback';

const InfrastructureGeoJsonSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(
    z.object({
      type: z.literal('Feature'),
      properties: z.object({
        name: z.string().optional(),
        "seamark:type": z.string().optional(),
        communication: z.string().optional(),
        man_made: z.string().optional(),
        substance: z.string().optional(),
        operator: z.string().optional(),
        capacity: z.string().optional(),
      }),
      geometry: z.object({
        type: z.enum(['LineString', 'MultiLineString', 'Point']),
        coordinates: z.union([
          z.array(z.array(z.number())),
          z.array(z.array(z.array(z.number()))),
          z.array(z.number()),
        ]),
      }),
    })
  ),
});

export async function getInfrastructure(type: 'cable' | 'pipeline') {
  const queries = {
    cable: `[out:json][timeout:90];(way["seamark:type"="cable_submarine"];way["communication"="line"]["location"="underwater"];);out geom 2000;`,
    pipeline: `[out:json][timeout:90];(way["man_made"="pipeline"]["substance"~"oil|gas|petroleum|fuel"];);out geom 2000;`
  };

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
    (base) => `${base.replace(/\/+$/, '')}?data=${encodeURIComponent(queries[type])}`
  );

  try {
    const result = await fetchWithFallback(
      urls,
      {
        next: { revalidate: 172800 },
      },
      {
        timeoutMs: 35000,
        retriesPerUrl: 1,
        headers: {
          'User-Agent': 'ATOM-Geopolitics-Dashboard/1.0',
          Accept: 'application/json, */*;q=0.8',
        },
      }
    );

    if (!result.response) {
      throw new Error(
        `Overpass API error: ${result.errors
          .map((e) => `${e.url}: ${e.error instanceof Error ? e.error.message : String(e.error)}`)
          .join(' | ')}`
      );
    }

    const rawData = await result.response.json();

    const geojson = {
      type: 'FeatureCollection',
      features: rawData.elements.map((el: any) => ({
        type: 'Feature',
        properties: {
          id: el.id,
          name: el.tags.name || el.tags.operator || `Unnamed ${type}`,
          ...el.tags,
        },
        geometry: {
          type: 'LineString',
          coordinates: el.geometry.map((pt: any) => [pt.lon, pt.lat]),
        },
      })),
    };

    const validated = InfrastructureGeoJsonSchema.safeParse(geojson);
    
    if (!validated.success) {
      console.error(`Zod Validation Failed for ${type}:`, validated.error.format());
      return { data: null, error: 'Inconsistent data format from provider.' };
    }

    return { data: validated.data, error: null };
  } catch (error) {
    console.error(`Error fetching ${type} infrastructure:`, error);
    return { data: null, error: error instanceof Error ? error.message : 'Unknown network error.' };
  }
}
