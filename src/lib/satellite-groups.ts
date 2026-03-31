export type SatelliteGroup =
  | 'visual'
  | 'starlink'
  | 'gps-ops'
  | 'planet'
  | 'military'
  | 'glo-ops'
  | 'galileo'
  | 'beidou'
  | 'science'
  | 'resource'
  | 'geodetic'
  | 'amateur'
  | 'noaa'
  | 'goes'
  | 'iridium-NEXT'
  | 'oneweb';

export interface SatelliteGroupInfo {
  id: SatelliteGroup;
  name: string;
  category: string;
  color: string;
  description: string;
}

export const SATELLITE_GROUPS: SatelliteGroupInfo[] = [
  { id: 'visual', name: 'Visual', category: 'visual', color: '#22d3ee', description: 'Bright satellites visible to naked eye' },
  { id: 'starlink', name: 'Starlink', category: 'starlink', color: '#60a5fa', description: 'SpaceX Starlink internet satellites' },
  { id: 'gps-ops', name: 'GPS', category: 'gps-ops', color: '#34d399', description: 'US GPS navigation satellites' },
  { id: 'planet', name: 'Planet', category: 'planet', color: '#2dd4bf', description: 'Planet Labs imaging satellites' },
  { id: 'military', name: 'Military', category: 'military', color: '#ef4444', description: 'Military satellites' },
  { id: 'glo-ops', name: 'GLONASS', category: 'glo-ops', color: '#fbbf24', description: 'Russian GLONASS navigation' },
  { id: 'galileo', name: 'Galileo', category: 'galileo', color: '#f472b6', description: 'European Galileo navigation' },
  { id: 'beidou', name: 'Beidou', category: 'beidou', color: '#fb7185', description: 'Chinese BeiDou navigation' },
  { id: 'science', name: 'Science', category: 'science', color: '#c084fc', description: 'Scientific research satellites' },
  { id: 'resource', name: 'Earth Resources', category: 'resource', color: '#4ade80', description: 'Earth observation and resources' },
  { id: 'geodetic', name: 'Geodetic', category: 'geodetic', color: '#a3e635', description: 'Geodetic survey satellites' },
  { id: 'amateur', name: 'Amateur Radio', category: 'amateur', color: '#818cf8', description: 'Amateur radio satellites' },
  { id: 'noaa', name: 'NOAA', category: 'noaa', color: '#38bdf8', description: 'NOAA weather satellites' },
  { id: 'goes', name: 'GOES', category: 'goes', color: '#2dd4bf', description: 'Geostationary weather satellites' },
  { id: 'iridium-NEXT', name: 'Iridium', category: 'iridium-NEXT', color: '#a78bfa', description: 'Iridium NEXT constellation' },
  { id: 'oneweb', name: 'OneWeb', category: 'oneweb', color: '#67e8f9', description: 'OneWeb broadband constellation' },
];
