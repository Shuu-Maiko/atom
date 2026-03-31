export interface MapAnnotation {
  id: string;
  type: 'point' | 'line' | 'area';
  name: string;
  notes?: string;
  color: string;
  positions: { lat: number; lon: number; height?: number }[];
  timestamp: number;
}

export interface Workspace {
  id: string;
  name: string;
  annotations: MapAnnotation[];
  scenarioUnits: any[];
  lastCameraPosition?: {
    destination: { x: number; y: number; z: number };
    orientation: { heading: number; pitch: number; roll: number };
  };
}
