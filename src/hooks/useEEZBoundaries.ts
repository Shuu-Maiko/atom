"use client";

import { useState, useEffect } from 'react';
import { getEEZData } from '@/app/actions/eez-boundaries';

export function useEEZBoundaries(enabled: boolean) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || data) return;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const result = await getEEZData();
        if (result) {
          setData(result);
        } else {
          setError('Failed to fetch EEZ data.');
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
