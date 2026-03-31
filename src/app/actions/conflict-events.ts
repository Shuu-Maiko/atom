"use server";

import { fetchWithFallback } from '@/lib/fetch-with-fallback';

export async function getConflictEvents() {
  const base =
    process.env.GDELT_BASE_URL?.replace(/\/+$/, '') ?? 'https://api.gdeltproject.org';
  const path = '/api/v2/geo/geo?query=mil_conflict&format=geojson';
  const urls = [
    `${base}${path}`,
    `https://api.gdeltproject.org${path}`,
  ];
  
  try {
    const result = await fetchWithFallback(
      urls,
      {
        next: { revalidate: 900 },
      },
      {
        timeoutMs: 15000,
        retriesPerUrl: 1,
        headers: {
          'User-Agent': 'ATOM-Geopolitics-Dashboard/1.0',
          Accept: 'application/json, application/geo+json;q=0.9, */*;q=0.8',
        },
      }
    );

    if (!result.response) {
      throw new Error(
        `Failed to fetch conflict events: ${result.errors
          .map((e) => `${e.url}: ${e.error instanceof Error ? e.error.message : String(e.error)}`)
          .join(' | ')}`
      );
    }

    const data = await result.response.json();
    return data;
  } catch (error) {
    console.error('Error fetching conflict events:', error);
    return null;
  }
}
