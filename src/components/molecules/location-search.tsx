import React, { useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { GeoCoordinates } from '@/features/booking/types/booking-types';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationSearchProps {
  onSelectLocation: (address: string, coords: GeoCoordinates) => void;
  placeholder?: string;
}

export function LocationSearch({
  onSelectLocation,
  placeholder = 'Search address or landmark in Cambodia...',
}: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.trim().length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          val + ', Cambodia'
        )}&limit=5`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setIsOpen(data.length > 0);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: SearchResult) => {
    onSelectLocation(item.display_name, {
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    });
    setQuery(item.display_name);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
        {loading && (
          <Loader2 className="absolute right-3 w-4 h-4 animate-spin text-slate-400" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.map((r, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(r)}
              className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-xs text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
            >
              <MapPin className="w-3.5 h-3.5 text-brand-600 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{r.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
