import { Cartesian3 } from 'cesium';

export interface VesselPosition {
  mmsi: string;
  name: string;
  callsign: string;
  country: string;
  position: Cartesian3;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  heading: number;
  status: string;
  shipType: string;
  destination: string;
  eta: string;
  length: number;
  width: number;
  draft: number;
  cargoType: string;
}

export interface AISStreamMessage {
  type: string;
  message: {
    ShipName?: { v: string };
    CallSign?: { v: string };
    IMO?: { v: string };
    MMSI: string;
    CoordinateSystem?: string;
    Lat: number;
    Lon: number;
    Sog: number;
    Cog: number;
    TrueHeading?: number;
    VesselType?: number;
    Destination?: { v: string };
    ETA?: { v: string };
    ShipLength?: number;
    ShipBeam?: number;
    draught?: number;
    Country?: string;
  };
}

export function getShipType(typeCode?: number): string {
  if (!typeCode) return 'Unknown';
  
  if (typeCode >= 70 && typeCode <= 79) return 'Wing in ground';
  if (typeCode >= 80 && typeCode <= 89) return 'Special Craft';
  if (typeCode >= 90 && typeCode <= 99) return 'Reserved';
  
  const types: Record<number, string> = {
    30: 'Fishing',
    31: 'Towing',
    32: 'Towing',
    33: 'Dredging',
    34: 'Diving',
    35: 'Military',
    36: 'Sailing',
    37: 'Pleasure Craft',
    50: 'Pilot Vessel',
    51: 'Search and Rescue',
    52: 'Tug',
    53: 'Port Tender',
    54: 'Anti-Pollution',
    55: 'Law Enforcement',
    60: 'Passenger Ship',
    61: 'Passenger Ship',
    62: 'Passenger Ship',
    63: 'Passenger Ship',
    64: 'Passenger Ship',
    65: 'Passenger Ship',
    66: 'Passenger Ship',
    67: 'Passenger Ship',
    68: 'Passenger Ship',
    69: 'Passenger Ship',
    83: 'Other',
  };
  
  return types[typeCode] || 'Unknown';
}

export function getCountryName(countryCode?: string): string {
  if (!countryCode) return 'Unknown';
  const countries: Record<string, string> = {
    'USA': 'United States',
    'RUS': 'Russia',
    'CHN': 'China',
    'JPN': 'Japan',
    'GBR': 'United Kingdom',
    'FRA': 'France',
    'DEU': 'Germany',
    'IND': 'India',
    'AUS': 'Australia',
    'KOR': 'South Korea',
    'SGP': 'Singapore',
    'NLD': 'Netherlands',
    'ITA': 'Italy',
    'PAN': 'Panama',
    'MHL': 'Marshall Islands',
    'LBR': 'Liberia',
    'BHR': 'Bahrain',
    'MYS': 'Malaysia',
    'IDN': 'Indonesia',
    'THA': 'Thailand',
    'VNM': 'Vietnam',
    'PHL': 'Philippines',
    'HKG': 'Hong Kong',
    'TWN': 'Taiwan',
    'ARE': 'UAE',
    'SAU': 'Saudi Arabia',
    'EGY': 'Egypt',
    'GRC': 'Greece',
    'TUR': 'Turkey',
    'NOR': 'Norway',
    'DNK': 'Denmark',
    'SWE': 'Sweden',
    'FIN': 'Finland',
    'POL': 'Poland',
    'UKR': 'Ukraine',
    'BRA': 'Brazil',
    'ARG': 'Argentina',
    'CHL': 'Chile',
    'COL': 'Colombia',
    'MEX': 'Mexico',
    'CAN': 'Canada',
  };
  return countries[countryCode.toUpperCase()] || countryCode;
}

export function isMilitaryVessel(vessel: VesselPosition): boolean {
  const militaryTypes = [
    'Aircraft Carrier',
    'Helicopter Carrier',
    'Amphibious Assault Ship',
    'Landing Ship Tank',
    'Destroyer',
    'Frigate',
    'Cruiser',
    'Submarine',
    'Corvette',
    'Minesweeper',
    'Patrol Vessel',
    'Military'
  ];
  
  const militaryCountries = ['USA', 'UK', 'Russia', 'China', 'Japan', 'France', 'India', 'Italy', 'South Korea', 'Australia'];
  
  return (
    militaryTypes.some(type => vessel.shipType.toLowerCase().includes(type.toLowerCase())) ||
    vessel.cargoType === 'Military' ||
    militaryCountries.includes(vessel.country)
  );
}

export function getVesselStyle(vessel: VesselPosition): { color: string; size: number } {
  if (isMilitaryVessel(vessel)) {
    return { color: '#ff4d00', size: 10 };
  }
  
  if (vessel.shipType.includes('Container')) {
    return { color: '#ffb000', size: 8 };
  }
  
  if (vessel.shipType.includes('Tanker')) {
    return { color: '#f59e0b', size: 8 };
  }
  
  if (vessel.shipType.includes('Cargo')) {
    return { color: '#fbbf24', size: 7 };
  }
  
  return { color: '#a1a1aa', size: 6 };
}

export function parseAISMessage(data: AISStreamMessage): VesselPosition | null {
  if (data.type !== 'PositionReport' && data.type !== 'StaticData') return null;
  const msg = data.message;
  if (msg.Lat === undefined || msg.Lon === undefined) return null;

  return {
    mmsi: msg.MMSI,
    name: msg.ShipName?.v?.trim() || 'Unknown Vessel',
    callsign: msg.CallSign?.v?.trim() || '',
    country: getCountryName(msg.Country),
    position: Cartesian3.fromDegrees(msg.Lon, msg.Lat, 100),
    latitude: msg.Lat,
    longitude: msg.Lon,
    speed: msg.Sog || 0,
    course: msg.Cog || 0,
    heading: msg.TrueHeading || 0,
    status: (msg.Sog || 0) > 0 ? 'Underway' : 'At Anchor',
    shipType: getShipType(msg.VesselType),
    destination: msg.Destination?.v || '',
    eta: msg.ETA?.v || '',
    length: msg.ShipLength || 0,
    width: msg.ShipBeam || 0,
    draft: msg.draught || 0,
    cargoType: getShipType(msg.VesselType),
  };
}
