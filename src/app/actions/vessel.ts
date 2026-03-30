'use server';

import { Vessel, VesselData, SAMPLE_VESSELS } from '@/lib/vessel-data';

function simulateVesselMovement(vessels: Vessel[]): Vessel[] {
  return vessels.map(vessel => {
    const speedKnots = vessel.speed || 10;
    const speedDegPerHour = speedKnots * 0.000166;
    const courseRad = (vessel.course * Math.PI) / 180;
    
    const latChange = speedDegPerHour * Math.cos(courseRad) * 0.1;
    const lonChange = speedDegPerHour * Math.sin(courseRad) * 0.1 / Math.cos((vessel.latitude * Math.PI) / 180);
    
    return {
      ...vessel,
      latitude: vessel.latitude + latChange,
      longitude: vessel.longitude + lonChange,
    };
  });
}

export async function fetchVessels(): Promise<VesselData> {
  try {
    const vessels = simulateVesselMovement(SAMPLE_VESSELS);
    
    return {
      vessels,
      fetchedAt: new Date().toISOString(),
      source: 'simulated-ais',
    };
  } catch (error) {
    return {
      vessels: SAMPLE_VESSELS,
      fetchedAt: new Date().toISOString(),
      source: 'fallback',
    };
  }
}

export async function fetchVesselsByPort(portCode: string): Promise<VesselData> {
  const portLocations: Record<string, { lat: number; lon: number }> = {
    'SIN': { lat: 1.26, lon: 103.83 },
    'HKG': { lat: 22.3, lon: 114.1 },
    'SHA': { lat: 31.23, lon: 121.47 },
    'LAX': { lat: 33.73, lon: -118.26 },
    'RTM': { lat: 51.95, lon: 4.12 },
  };
  
  const port = portLocations[portCode];
  if (!port) {
    return fetchVessels();
  }
  
  const allVessels = await fetchVessels();
  const nearbyVessels = allVessels.vessels.filter(v => {
    const dist = Math.sqrt(
      Math.pow(v.latitude - port.lat, 2) + 
      Math.pow(v.longitude - port.lon, 2)
    );
    return dist < 5;
  });
  
  return {
    vessels: nearbyVessels,
    fetchedAt: new Date().toISOString(),
    source: 'port-filtered',
  };
}
