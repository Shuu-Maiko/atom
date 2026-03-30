'use client';

import { useState } from 'react';
import { MapPin, X, Copy, Newspaper, Loader2 } from 'lucide-react';
import { getNewsByCountry } from '@/app/actions/news';

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
  
  const placeName = addr.city || addr.town || addr.village || addr.neighbourhood || place.display_name?.split(',')[0] || "Unknown";
  
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
    <div className="absolute top-20 right-4 z-20 bg-black/90 backdrop-blur border border-white/20 p-4 rounded-lg text-white w-80 max-h-[70vh] overflow-y-auto">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-white/60" />
          <h3 className="text-base font-semibold">{placeName}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>
      
      <p className="text-xs text-white/40 mb-3">{place.type}</p>
      
      <div className="space-y-2 text-sm border-t border-white/10 pt-3">
        {fullAddress && (
          <div>
            <p className="text-white/40 text-xs mb-0.5">Address</p>
            <p className="text-white">{fullAddress}</p>
          </div>
        )}
        {addr.state && (
          <div>
            <p className="text-white/40 text-xs mb-0.5">State</p>
            <p className="text-white">{addr.state}</p>
          </div>
        )}
        {addr.country && (
          <div>
            <p className="text-white/40 text-xs mb-0.5">Country</p>
            <p className="text-white">{addr.country}</p>
          </div>
        )}
        {place.clickLat !== undefined && place.clickLon !== undefined && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/40 text-xs mb-0.5">Coordinates</p>
              <p className="text-white text-xs">
                {place.clickLat.toFixed(4)}, {place.clickLon.toFixed(4)}
              </p>
            </div>
            <button
              onClick={copyCoords}
              className="p-2 hover:bg-white/10 rounded transition-colors"
              title="Copy coordinates"
            >
              <Copy className="w-3.5 h-3.5 text-white/60" />
            </button>
          </div>
        )}
        
        <button
          onClick={fetchNews}
          className="w-full flex items-center justify-center gap-2 mt-3 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors text-sm"
        >
          <Newspaper className="w-4 h-4" />
          {showNews ? 'News' : 'View News'}
        </button>
        
        {showNews && (
          <div className="mt-3 pt-3 border-t border-white/10">
            {newsLoading ? (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-white/60">Loading news...</span>
              </div>
            ) : news.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-white/40">Latest from {addr.country || 'World'}</p>
                {news.slice(0, 5).map((article, i) => (
                  <a
                    key={i}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:bg-white/5 p-2 rounded transition-colors"
                  >
                    <p className="text-sm text-white line-clamp-2">{article.title}</p>
                    <p className="text-xs text-white/40 mt-1">{article.source?.name}</p>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40 py-2">No news found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceInfo;
