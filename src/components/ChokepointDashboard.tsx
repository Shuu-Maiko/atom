"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Anchor, Clock, AlertTriangle, TrendingUp, X, Share2, ShieldAlert } from 'lucide-react';
import { getChokepointAnalytics, ChokepointAnalytics } from '@/app/actions/chokepoint-analytics';
import Image from 'next/image';

interface ChokepointDashboardProps {
  chokepointId: string | null;
  onClose: () => void;
  vesselCount?: number;
}

export function ChokepointDashboard({ chokepointId, onClose, vesselCount = 0 }: ChokepointDashboardProps) {
  const [data, setData] = useState<ChokepointAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chokepointId) return;

    async function fetchData() {
      if (!chokepointId) return;
      setLoading(true);
      const result = await getChokepointAnalytics(chokepointId, vesselCount);
      if (result.data) {
        setData(result.data);
      }
      setLoading(false);
    }

    fetchData();
  }, [chokepointId, vesselCount]);

  if (!chokepointId) return null;

  return (
    <div className="fixed right-6 top-6 bottom-6 w-[400px] z-[60] pointer-events-none flex flex-col gap-4 font-mono">
      <Card className="search-card flex-1 flex flex-col pointer-events-auto overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 border-white/10 bg-black/95 rounded-[var(--radius-sm)]">
        {/* image */}
        <div className="relative h-40 w-full group overflow-hidden">
          {/* ... (rest of the header image block) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
          <Image 
            src={`https://images.unsplash.com/photo-1544415037-33762828e1ca?auto=format&fit=crop&q=80&w=800`} 
            alt="Strategic Node"
            fill
            className="object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-700"
          />
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-black/80 border border-white/10 text-white hover:border-primary transition-colors rounded-[var(--radius-sm)]"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="absolute bottom-4 left-6 z-20">
            <h2 className="text-xl font-bold text-white tracking-widest uppercase mb-1">
              {data?.name || 'SYNCING...'}
            </h2>
            <div className="flex gap-2">
              <div className="text-[10px] bg-primary text-black px-1.5 font-bold uppercase tracking-tighter">LVL-4 NODE</div>
              <div className="text-[10px] bg-white/10 text-white/50 px-1.5 font-bold uppercase tracking-tighter">SECURED</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 bg-black/40">
            <div className="w-8 h-8 border border-primary/20 border-t-primary animate-spin" />
            <div className="text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase">Uplink Synchronization...</div>
          </div>
        ) : data ? (
          <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {/* stats */}
            <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/10 rounded-[var(--radius-sm)] overflow-hidden">
              <StatBlock icon={TrendingUp} value={data.currentVessels} unit="UNITS" />
              <StatBlock icon={Clock} value={data.averageDwellTime.toFixed(1)} unit="HR LATENCY" />
            </div>

            {/* assessment */}
            <div className="space-y-3">
              <div className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                <Anchor className="w-3 h-3" /> Node Assessment
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed border-l border-primary/30 pl-3">
                Live surveillance of <span className="text-white">{data.name}</span> confirms operational status. Vessel density correlates with strategic projection reports. Performance index remains at <span className="text-white">92%</span> nominal.
              </p>
            </div>

            {/* alerts */}
            {data.alerts.length > 0 && (
              <div className="space-y-1">
                {data.alerts.map((alert, i) => (
                  <div key={i} className="flex gap-3 bg-red-500/5 border-l border-red-500 p-2 text-[10px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="text-white/80 font-bold uppercase tracking-wide">{alert}</span>
                  </div>
                ))}
              </div>
            )}

            {/* trends */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">Temporal Density</span>
                <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Live Stream</span>
              </div>
              <div className="h-[160px] w-full bg-black/20 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.densityTrend}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#ffffff10" 
                      fontSize={8} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#ffffff10" 
                      fontSize={8} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#050505', border: '1px solid #ffffff10', fontSize: '9px', borderRadius: '0px' }}
                      itemStyle={{ color: 'var(--primary)' }}
                    />
                    <Area 
                      type="step" 
                      dataKey="count" 
                      stroke="var(--primary)" 
                      strokeWidth={1.5}
                      fill="var(--primary)" 
                      fillOpacity={0.05}
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* share */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Source: Signal-9 Link</div>
              <Share2 className="w-3 h-3 text-white/20 hover:text-white cursor-pointer" />
            </div>
          </CardContent>
        ) : (
          <div className="flex-1 flex items-center justify-center p-12 text-center text-white/20 text-[9px] uppercase tracking-[0.4em]">
            Awaiting Target Selection
          </div>
        )}
      </Card>
    </div>
  );
}

function StatBlock({ icon: Icon, value, unit }: any) {
  return (
    <div className="bg-black/40 p-4 hover:bg-black/60 transition-colors">
      <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
        <Icon className="w-3 h-3" /> {unit}
      </div>
      <div className="text-2xl font-bold text-white tracking-tighter tabular-nums leading-none">
        {value}
      </div>
    </div>
  );
}
