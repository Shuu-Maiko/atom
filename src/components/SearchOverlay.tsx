'use client';

import { useState, useCallback } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  [key: string]: any;
}

interface Props {
  onSearch: (query: string) => Promise<any[]>;
  onSelect: (result: SearchResult) => void;
  onClose: () => void;
}

export default function SearchOverlay({ onSearch, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await onSearch(query);
      setResults(data);
      setIsOpen(true);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [query, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelect = (result: SearchResult) => {
    onSelect(result);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
      <div className="bg-black/90 backdrop-blur border border-white/20 rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 p-3">
          <Search className="w-5 h-5 text-white/60" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search places..."
            className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-sm"
          />
          {loading ? (
            <Loader2 className="w-5 h-5 text-white/60 animate-spin" />
          ) : query ? (
            <button onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}>
              <X className="w-5 h-5 text-white/60 hover:text-white" />
            </button>
          ) : null}
        </div>
        
        {isOpen && results.length > 0 && (
          <div className="border-t border-white/10 max-h-64 overflow-y-auto">
            {results.map((result, index) => (
              <button
                key={result.place_id || result.lat + result.lon || index}
                onClick={() => handleSelect(result)}
                className="w-full flex items-start gap-3 p-3 hover:bg-white/10 transition-colors text-left"
              >
                <MapPin className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-white text-sm truncate">{result.display_name.split(',')[0]}</p>
                  <p className="text-white/40 text-xs truncate">{result.display_name.split(',').slice(1).join(',')}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
