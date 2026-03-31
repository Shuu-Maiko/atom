
export interface InfrastructureFeature {
  id: string;
  name: string;
  type: 'cable' | 'pipeline';
  subtype?: string;
  status?: 'active' | 'planned' | 'decommissioned';
  owner?: string;
  capacity?: string;
  geometry: {
    type: 'LineString' | 'MultiLineString';
    coordinates: number[][] | number[][][];
  };
}

export interface MilitaryBase {
  id: string;
  name: string;
  country: string;
  type: 'air' | 'naval' | 'army' | 'missile' | 'other';
  lat: number;
  lon: number;
  sensorRange?: number;
  sensorType?: 'radar' | 'jamming';
  wikiUrl?: string;
  personnel?: number;
  capabilities?: string[];
}

export interface ConflictEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  severity: number;
  lat: number;
  lon: number;
  sourceUrl: string;
  summary: string;
}

export interface ScenarioUnit {
  id: string;
  name: string;
  type: 'infantry' | 'armor' | 'naval' | 'air' | 'ngo' | 'civ';
  side: 'friendly' | 'hostile' | 'neutral';
  lat: number;
  lon: number;
  description?: string;
  vector?: {
    heading: number;
    speed: number;
  };
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}
