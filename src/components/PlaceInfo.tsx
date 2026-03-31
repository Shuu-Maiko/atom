'use client';

import { useState } from 'react';
import { MapPin, X, Copy, Newspaper, Loader2, Share2, Globe, Clock, Target } from 'lucide-react';
import { getNewsByCountry } from '@/app/actions/news';
import Image from 'next/image';

interface AddressParts {
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  district?: string;
  county?: string;
  state?: string;
  country?: string;
}

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: { name: string };
}

interface Props {
  place: {
    display_name: string;
    type: string;
    address?: AddressParts;
    clickLat?: number;
    clickLon?: number;
  };
  onClose: () => void;
}

const PlaceInfo = ({ place, onClose }: Props) => {
  const [showNews, setShowNews] = useState(false);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  
  const addr = place.address || {};
  const placeName = addr.city || addr.town || addr.village || addr.neighbourhood || place.display_name?.split(',')[0] || "UNKNOWN_OBJ";
  
  const parts = [
    addr.city || addr.town || addr.village,
    addr.district || addr.county,
    addr.state,
    addr.country,
  ].filter(Boolean);
  
  const fullAddress = parts.join(', ');

  const copyCoords = () => {
    if (place.clickLat && place.clickLon) {
      navigator.clipboard.writeText(`${place.clickLat.toFixed(6)}, ${place.clickLon.toFixed(6)}`);
    }
  };

  const fetchNews = async () => {
    setShowNews(true);
    if (news.length > 0) return;
    
    setNewsLoading(true);
    try {
      const country = addr.country || 'world';
      const data = await getNewsByCountry(country);
      setNews(data.articles || []);
    } catch (err) {
    } finally {
      setNewsLoading(false);
    }
  };

  return (
    <div className="fixed top-24 right-6 w-80 z-50 pointer-events-none font-mono">
      <div className="search-card pointer-events-auto overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-1 duration-300 border-white/20 bg-black/95 rounded-[var(--radius-sm)]">
        {/* header */}
        <div className="bg-primary/10 p-4 border-b border-white/10 relative">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 text-[9px] font-bold text-primary uppercase tracking-[0.4em]">
              <Target className="w-3.5 h-3.5" /> G-POS LOCK
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h3 className="text-white text-lg font-bold tracking-widest uppercase truncate">{placeName}</h3>
        </div>

        <div className="p-4 space-y-4">
          {/* coords */}
          <div className="bg-white/5 border border-white/10 p-3 rounded-[var(--radius-sm)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Telemetry</span>
              <button onClick={copyCoords} className="text-white/20 hover:text-primary transition-colors">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-sm font-bold text-white tabular-nums tracking-widest">
              {place.clickLat?.toFixed(6)} N / {place.clickLon?.toFixed(6)} E
            </div>
          </div>

          {/* region */}
          <div className="space-y-1">
            <div className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Address Index</div>
            <p className="text-[11px] text-white/80 leading-relaxed italic border-l border-white/20 pl-3">
              {fullAddress || 'N/A: REM-LOC'}
            </p>
          </div>

          {/* actions */}
          <div className="space-y-4">
            {!showNews ? (
              <button
                onClick={fetchNews}
                className="w-full h-11 flex items-center justify-center gap-3 bg-white/10 border border-white/20 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-black transition-all"
              >
                <Newspaper className="w-4 h-4" />
                INITIATE NEWS SYNC
              </button>
            ) : (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center justify-between border-b border-white/20 pb-1">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Live Node Feed</span>
                </div>
                {newsLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <div className="w-5 h-5 border-2 border-primary/20 border-t-primary animate-spin" />
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Decrypting Signal...</span>
                  </div>
                ) : news.length > 0 ? (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                    {news.slice(0, 5).map((article, i) => (
                      <a
                        key={i}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/5 p-3 transition-all"
                      >
                        <p className="text-[11px] text-white/70 group-hover:text-white font-bold leading-snug line-clamp-2">
                          {article.title}
                        </p>
                        <p className="text-[9px] font-black text-primary uppercase tracking-tighter mt-1.5">{article.source?.name}</p>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-white/20 text-[10px] font-black uppercase tracking-widest border border-white/5 bg-white/5">
                    No signal data detected
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* sync status */}
        <div className="bg-black/60 p-2 flex items-center justify-between border-t border-white/5">
          <div className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em] flex items-center gap-1.5 px-2">
            <Clock className="w-3 h-3" /> RT-SYNC COMPLETE
          </div>
          <div className="flex gap-1 pr-2">
             <div className="w-1.5 h-1.5 bg-emerald-500/30" />
             <div className="w-1.5 h-1.5 bg-emerald-500/30" />
             <div className="w-1.5 h-1.5 bg-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceInfo;
