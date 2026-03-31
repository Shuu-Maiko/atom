"use server";

import { z } from 'zod';

const AnalyticsSchema = z.object({
  id: z.string(),
  name: z.string(),
  currentVessels: z.number(),
  averageDwellTime: z.number(),
  densityTrend: z.array(z.object({
    time: z.string(),
    count: z.number(),
  })),
  alerts: z.array(z.string()),
});

export type ChokepointAnalytics = z.infer<typeof AnalyticsSchema>;

const CHOKEPOINT_BOUNDS: Record<string, { minLat: number; maxLat: number; minLon: number; maxLon: number }> = {
  'choke-suez': { minLat: 29.5, maxLat: 31.5, minLon: 32.0, maxLon: 32.8 },
  'choke-panama': { minLat: 8.5, maxLat: 9.5, minLon: -80.2, maxLon: -79.2 },
  'choke-malacca': { minLat: 1.0, maxLat: 3.0, minLon: 101.0, maxLon: 104.0 },
  'choke-hormuz': { minLat: 26.0, maxLat: 27.5, minLon: 55.5, maxLon: 57.0 },
  'choke-gibraltar': { minLat: 35.8, maxLat: 36.2, minLon: -5.8, maxLon: -5.2 },
  'choke-bab-el-mandeb': { minLat: 12.0, maxLat: 13.0, minLon: 43.0, maxLon: 43.8 },
};

export async function getChokepointAnalytics(id: string, vesselCount: number): Promise<{ data: ChokepointAnalytics | null; error: string | null }> {
  const bounds = CHOKEPOINT_BOUNDS[id];
  if (!bounds && !id.startsWith('choke-')) {
    return { data: null, error: 'Invalid chokepoint ID' };
  }

  try {
    
    const baseCount = id.includes('suez') || id.includes('malacca') ? 45 : 15;
    const currentCount = vesselCount > 0 ? vesselCount : baseCount + Math.floor(Math.random() * 20);
    
    const densityTrend = Array.from({ length: 12 }, (_, i) => ({
      time: `${12 - i}h ago`,
      count: Math.floor(currentCount * (0.8 + Math.random() * 0.4)),
    }));

    const data: ChokepointAnalytics = {
      id,
      name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      currentVessels: currentCount,
      averageDwellTime: 4.2 + (Math.random() * 2.5),
      densityTrend,
      alerts: currentCount > 60 ? ['Traffic Congestion Detected', 'Anomaly: Slow speed in transit'] : [],
    };

    return { data: AnalyticsSchema.parse(data), error: null };
  } catch (error) {
    console.error('Error calculating chokepoint analytics:', error);
    return { data: null, error: 'Failed to generate analytics.' };
  }
}
