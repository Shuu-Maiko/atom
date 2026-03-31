"use client";

import { useState, useEffect } from 'react';
import { getPortsData } from '@/app/actions/ports-chokepoints';

export function useStrategicPorts(enabled: boolean) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || data.length > 0) return;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await getPortsData();
        if (result && result.length > 0) {
          setData(result);
        } else {
          setError('Failed to fetch ports data.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [enabled, data]);

  return { data, loading, error };
}
