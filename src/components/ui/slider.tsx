"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  className?: string;
}

function Slider({
  className,
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  ...props
}: SliderProps) {
  const controlled = value !== undefined;
  const currentValue = controlled ? value[0] : (defaultValue?.[0] ?? min);
  const percent = ((currentValue - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onValueChange?.([val]);
  };

  return (
    <div
      data-slot="slider"
      className={cn("relative flex w-full touch-none items-center select-none", className)}
      {...props}
    >
      {/* track */}
      <div className="relative h-1 w-full rounded-full bg-muted overflow-hidden">
        {/* filled indicator */}
        <div
          data-slot="slider-range"
          className="absolute h-full bg-primary"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* native range input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />

      {/* visual thumb */}
      <div
        data-slot="slider-thumb"
        className="absolute block size-3 shrink-0 rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none pointer-events-none"
        style={{ left: `calc(${percent}% - 6px)` }}
      />
    </div>
  );
}

export { Slider }
