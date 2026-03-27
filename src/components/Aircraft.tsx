"use client"
import { useAircraftPositions } from "@/hooks/useAircraftPositions"
import { Entity } from "cesium"

export const Aircraft = () => {
  const { positions, loading, error } = useAircraftPositions();

  if (loading) {
    return <div className="p-4 text-white">Loading aeroplanes... ({positions.length})</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }


  return (
    <Entity>

    </Entity>
  )
}

