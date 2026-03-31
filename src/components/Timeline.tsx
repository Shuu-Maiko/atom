"use client";

import React, { useState, useEffect } from 'react';
import { Play, Pause, FastForward, Rewind, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { JulianDate } from 'cesium';
import { useCesium } from 'resium';

interface TimelineProps {
  startTime: JulianDate;
  stopTime: JulianDate;
}

export function Timeline({ startTime, stopTime }: TimelineProps) {
  const { viewer } = useCesium();
  const [currentTime, setCurrentTime] = useState<JulianDate>(JulianDate.now());
  const [isPlaying, setIsPlaying] = useState(true);
  const [multiplier, setMultiplier] = useState(1);

  useEffect(() => {
    if (!viewer) return;

    const removeListener = viewer.clock.onTick.addEventListener((clock) => {
      setCurrentTime(JulianDate.clone(clock.currentTime));
      setIsPlaying(clock.shouldAnimate);
      setMultiplier(clock.multiplier);
    });

    return () => removeListener();
  }, [viewer]);

  const togglePlay = () => {
    if (!viewer) return;
    viewer.clock.shouldAnimate = !viewer.clock.shouldAnimate;
    setIsPlaying(viewer.clock.shouldAnimate);
  };

  const resetTime = () => {
    if (!viewer) return;
    viewer.clock.currentTime = JulianDate.now();
    viewer.clock.shouldAnimate = true;
  };

  const setTimeFromSlider = (value: number | number[]) => {
    if (!viewer) return;
    const val = Array.isArray(value) ? value[0] : value;
    const totalSeconds = JulianDate.secondsDifference(stopTime, startTime);
    const offset = (val / 100) * totalSeconds;
    viewer.clock.currentTime = JulianDate.addSeconds(startTime, offset, new JulianDate());
  };

  const changeMultiplier = (delta: number) => {
    if (!viewer) return;
    viewer.clock.multiplier = Math.max(1, Math.min(1000, viewer.clock.multiplier * delta));
    setMultiplier(viewer.clock.multiplier);
  };

  const progress = viewer
    ? (JulianDate.secondsDifference(currentTime, startTime) / JulianDate.secondsDifference(stopTime, startTime)) * 100
    : 0;

  const formatTacticalTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[85%] max-w-5xl z-50 pointer-events-none group">
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-4 pointer-events-auto transition-all hover:bg-black/80 hover:border-white/20">

        {/* display */}
        <div className="flex items-center justify-between px-2 mb-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary amber-glow-soft">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-0.5">Tactical Time-Stream</div>
              <div className="text-sm font-mono font-bold text-white tracking-widest tabular-nums">
                {formatTacticalTime(JulianDate.toDate(currentTime))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div className="flex flex-col">
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-0.5">Playback Velocity</div>
              <div className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                {multiplier}X Speed
              </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col">
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-0.5">ZAPORIZHZHIA SECTOR</div>
              <div className="text-[11px] font-bold text-white/70 uppercase">Mission Active</div>
            </div>
          </div>
        </div>

        {/* slider */}
        <div className="relative group/slider px-2">
          <Slider
            value={[progress]}
            max={100}
            step={0.01}
            onValueChange={(val: any) => setTimeFromSlider(val)}
            className="flex-1 cursor-pointer"
          />
          <div className="absolute -bottom-2 left-2 right-2 flex justify-between opacity-0 group-hover/slider:opacity-100 transition-opacity">
            <span className="text-[9px] font-mono text-white/30">{JulianDate.toDate(startTime).toLocaleDateString()}</span>
            <span className="text-[9px] font-mono text-white/30">{JulianDate.toDate(stopTime).toLocaleDateString()}</span>
          </div>
        </div>

        {/* controls */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => changeMultiplier(0.5)}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-all"
              title="Decelerate"
            >
              <Rewind className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary text-black amber-glow-soft hover:scale-105 active:scale-95 transition-all shadow-lg"
              title={isPlaying ? 'Pause Feed' : 'Resume Feed'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </button>

            <button
              onClick={() => changeMultiplier(2)}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-all"
              title="Accelerate"
            >
              <FastForward className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-white/10 mx-2" />

            <button
              onClick={resetTime}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black text-white/40 hover:text-primary transition-all"
              title="Resync Real-Time"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
            Strategic News Synchronizer v2.4
          </div>
        </div>
      </div>
    </div>
  );
}
