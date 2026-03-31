"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  VesselPosition, 
  AISStreamMessage, 
  parseAISMessage 
} from '@/lib/vessel-utils';
import { fetchVessels } from '@/app/actions/vessel';
import { Cartesian3 } from 'cesium';

export function useVesselPositions(enabled: boolean = false) {
  const [positions, setPositions] = useState<VesselPosition[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const vesselsRef = useRef<Map<string, VesselPosition>>(new Map());

  const connect = useCallback(() => {
    const apiKey = process.env.NEXT_PUBLIC_AISSTREAM_API_KEY || process.env.AISSTREAM_API_KEY;
    
    if (!apiKey) {
      console.warn('No AISStream API key configured, using simulated vessel fallback.');
      fetchVessels().then(res => {
        const fallbackPositions = res.vessels.map(v => ({
           ...v,
           position: Cartesian3.fromDegrees(v.longitude, v.latitude, 100),
        }));
        setPositions(fallbackPositions as VesselPosition[]);
      }).finally(() => setLoading(false));
      return;
    }

    try {
      if (wsRef.current) wsRef.current.close();
      
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
          const vessel = parseAISMessage(data);
          
          if (vessel) {
            vesselsRef.current.set(vessel.mmsi, vessel);
            
            if (vesselsRef.current.size > 500) {
              const firstKey = vesselsRef.current.keys().next().value;
              if (firstKey) vesselsRef.current.delete(firstKey);
            }
            
            setPositions(Array.from(vesselsRef.current.values()));
          }
        } catch (e) {
        }
      };

      ws.onerror = () => {
        setError('WebSocket connection error');
      };

      ws.onclose = () => {
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
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
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [enabled, connect]);

  useEffect(() => {
    if (positions.length > 0 && loading) {
      setLoading(false);
    }
  }, [positions.length, loading]);

  return { positions, loading, error };
}
