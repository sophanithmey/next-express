import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { GeoCoordinates } from '@/features/booking/types/booking-types';
import { searchPhnomPenhZones } from '@/features/booking/data/phnom-penh-zones';

interface SearchResult {
  display_name: string;
  lat: number;
  lng: number;
  district?: string;
}

interface LocationSearchProps {
  onSelectLocation: (address: string, coords: GeoCoordinates) => void;
  placeholder?: string;
}

export function LocationSearch({
  onSelectLocation,
  placeholder = 'Search address or landmark in Phnom Penh...',
}: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (val.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const matchedZones = searchPhnomPenhZones(val).map((z) => ({
      display_name: `${z.name}, ${z.address}`,
      lat: z.coordinates.lat,
      lng: z.coordinates.lng,
      district: z.district,
    }));

    setResults(matchedZones);
    setIsOpen(matchedZones.length > 0);
  };

  const handleSelect = (item: SearchResult) => {
    onSelectLocation(item.display_name, {
      lat: item.lat,
      lng: item.lng,
    });
    setQuery(item.display_name);
    setIsOpen(false);
  };

  return (
    <div className='relative w-full'>
      <div className='relative flex items-center'>
        <Search className='absolute left-3 w-4 h-4 text-slate-400 pointer-events-none' />
        <input
          type='text'
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className='w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20'
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className='absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg'>
          {results.map((r, idx) => (
            <button
              key={idx}
              type='button'
              onClick={() => handleSelect(r)}
              className='flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-950 transition-colors border-b border-slate-100 last:border-b-0'
            >
              <MapPin className='w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0' />
              <div className='min-w-0 flex-1'>
                <span className='font-semibold block truncate'>
                  {r.display_name.split(',')[0]}
                </span>
                <span className='text-[11px] text-slate-500 block truncate'>
                  {r.display_name}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
