import { useState, useEffect, useRef, useCallback } from 'react';
import { Cartesian3 } from 'cesium';

export interface VesselPosition {
  mmsi: string;
  name: string;
  callsign: string;
  country: string;
  position: ReturnType<typeof Cartesian3.fromDegrees>;
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

interface AISStreamMessage {
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

function getShipType(typeCode?: number): string {
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
    56: 'Spare',
    57: 'Spare',
    58: 'Spare',
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
    90: 'Other',
  };
  
  return types[typeCode] || 'Unknown';
}

function getCountryName(countryCode?: string): string {
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

export function useVesselPositions(enabled: boolean = false) {
  const [positions, setPositions] = useState<VesselPosition[]>([]);
  const [loading, setLoading] = useState(!enabled);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const vesselsRef = useRef<Map<string, VesselPosition>>(new Map());

  const connect = useCallback(() => {
    const apiKey = process.env.NEXT_PUBLIC_AISSTREAM_API_KEY || process.env.AISSTREAM_API_KEY;
    
    if (!apiKey) {
      setError('No AISStream API key configured');
      setLoading(false);
      return;
    }

    try {
      const ws = new WebSocket('wss://stream.aisstream.io/v0/stream');
      wsRef.current = ws;

      ws.onopen = () => {
        const subscriptionMessage = {
          Apikey: apiKey,
          BoundingBoxes: [[-90, -180], [90, 180]],
          FilterMessageTypes: ['PositionReport', 'StaticData'],
        };
        ws.send(JSON.stringify(subscriptionMessage));
      };

      ws.onmessage = (event) => {
        try {
          const data: AISStreamMessage = JSON.parse(event.data);
          
          if (data.type === 'PositionReport' || data.type === 'StaticData') {
            const msg = data.message;
            
            if (msg.Lat !== undefined && msg.Lon !== undefined) {
              const vessel: VesselPosition = {
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
              
              vesselsRef.current.set(msg.MMSI, vessel);
              
              const allVessels = Array.from(vesselsRef.current.values()).slice(0, 500);
              setPositions(allVessels);
            }
          }
        } catch (e) {
        }
      };

      ws.onerror = (err) => {
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        }
      };
    } catch (err) {
      setError('Failed to connect to AISStream');
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      setLoading(true);
      connect();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [enabled, connect]);

  useEffect(() => {
    if (positions.length > 0 && loading) {
      setLoading(false);
    }
  }, [positions.length, loading]);

  return { positions, loading, error };
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
    return { color: '#ef4444', size: 10 };
  }
  
  if (vessel.shipType.includes('Container')) {
    return { color: '#3b82f6', size: 8 };
  }
  
  if (vessel.shipType.includes('Tanker')) {
    return { color: '#f59e0b', size: 8 };
  }
  
  if (vessel.shipType.includes('Cargo')) {
    return { color: '#10b981', size: 7 };
  }
  
  return { color: '#6b7280', size: 6 };
}
