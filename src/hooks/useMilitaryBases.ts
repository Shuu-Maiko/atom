"use client";

import { useState, useEffect } from 'react';
import { getMilitaryBases } from '@/app/actions/military-bases';

export function useMilitaryBases(enabled: boolean) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || data.length > 0) return;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await getMilitaryBases();
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setData(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown military hook error.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [enabled, data]);

  return { data, loading, error };
}
