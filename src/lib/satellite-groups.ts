export type SatelliteGroup = 
  | 'visual' 
  | 'iridium-NEXT' 
  | 'amateur' 
  | 'starlink' 
  | 'planet' 
  | 'spire' 
  | 'globalstar' 
  | 'orbcomm' 
  | 'leosat' 
  | 'gps-ops' 
  | 'glo-ops' 
  | 'galileo' 
  | 'beidou' 
  | 'nwslot' 
  | 'dmc' 
  | 'science' 
  | 'tdrss' 
  | 'sbas' 
  | 'weather' 
  | 'earth-observation' 
  | 'communications';

export const SATELLITE_GROUPS: { id: SatelliteGroup; name: string; color: string; description: string }[] = [
  { id: 'visual', name: 'Visual', color: '#22d3ee', description: 'Bright satellites visible to naked eye' },
  { id: 'iridium-NEXT', name: 'Iridium', color: '#a78bfa', description: 'Iridium NEXT satellite constellation' },
  { id: 'starlink', name: 'Starlink', color: '#60a5fa', description: 'SpaceX Starlink internet satellites' },
  { id: 'gps-ops', name: 'GPS', color: '#34d399', description: 'US GPS navigation satellites' },
  { id: 'glo-ops', name: 'GLONASS', color: '#fbbf24', description: 'Russian GLONASS navigation' },
  { id: 'galileo', name: 'Galileo', color: '#f472b6', description: 'EU Galileo navigation system' },
  { id: 'beidou', name: 'BeiDou', color: '#fb7185', description: 'Chinese BeiDou navigation' },
  { id: 'weather', name: 'Weather', color: '#38bdf8', description: 'Weather monitoring satellites' },
  { id: 'earth-observation', name: 'Earth Obs', color: '#4ade80', description: 'Earth observation satellites' },
  { id: 'communications', name: 'Comms', color: '#a3e635', description: 'Communication satellites' },
  { id: 'science', name: 'Science', color: '#c084fc', description: 'Scientific research satellites' },
  { id: 'amateur', name: 'Amateur', color: '#f87171', description: 'Amateur radio satellites' },
  { id: 'planet', name: 'Planet', color: '#2dd4bf', description: 'Planet Labs imaging satellites' },
  { id: 'spire', name: 'Spire', color: '#818cf8', description: 'Spire Global satellites' },
  { id: 'tdrss', name: 'TDRSS', color: '#facc15', description: 'NASA Tracking and Data Relay' },
];
