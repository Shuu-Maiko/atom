"use client";

import { useState, useEffect } from 'react';
import { getInfrastructure } from '@/app/actions/infrastructure';

export function useInfrastructure(type: 'cable' | 'pipeline', enabled: boolean) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || data) return;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await getInfrastructure(type);
        if (response.error) {
          setError(response.error);
        } else {
          setData(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown hook error.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [enabled, type, data]);

  return { data, loading, error };
}
