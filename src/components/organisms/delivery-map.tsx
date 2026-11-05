'use client';

import React, { useMemo, useState } from 'react';
import { GeoCoordinates } from '@/features/booking/types/booking-types';
import { MapPin, ExternalLink } from 'lucide-react';

interface DeliveryMapProps {
  pickupCoords?: GeoCoordinates;
  dropoffCoords?: GeoCoordinates;
  isDraggableDropoff?: boolean;
  onDropoffChange?: (coords: GeoCoordinates) => void;
  className?: string;
  zoom?: number;
}

const DEFAULT_CENTER: GeoCoordinates = { lat: 11.5564, lng: 104.9282 }; // Phnom Penh Central

export function DeliveryMap({
  pickupCoords,
  dropoffCoords,
  className = 'h-72 w-full',
  zoom = 15,
}: DeliveryMapProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine Google Maps embed URL
  const embedUrl = useMemo(() => {
    // If both pickup and drop-off are available, show route directions
    if (pickupCoords && dropoffCoords) {
      const saddr = `${pickupCoords.lat},${pickupCoords.lng}`;
      const daddr = `${dropoffCoords.lat},${dropoffCoords.lng}`;
      return `https://www.google.com/maps?saddr=${encodeURIComponent(saddr)}&daddr=${encodeURIComponent(daddr)}&output=embed`;
    }

    // Single location pin (drop-off or pickup)
    const target = dropoffCoords || pickupCoords || DEFAULT_CENTER;
    return `https://www.google.com/maps?q=${target.lat},${target.lng}&z=${zoom}&output=embed`;
  }, [pickupCoords, dropoffCoords, zoom]);

  const activeCoords = dropoffCoords || pickupCoords || DEFAULT_CENTER;
  const externalGoogleMapsUrl = useMemo(() => {
    if (pickupCoords && dropoffCoords) {
      return `https://www.google.com/maps/dir/${pickupCoords.lat},${pickupCoords.lng}/${dropoffCoords.lat},${dropoffCoords.lng}`;
    }
    return `https://www.google.com/maps?q=${activeCoords.lat},${activeCoords.lng}`;
  }, [pickupCoords, dropoffCoords, activeCoords]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-2xs">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-xs text-slate-400 animate-pulse z-10">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600 animate-bounce" />
            <span>Loading Google Map…</span>
          </div>
        </div>
      )}

      <iframe
        key={embedUrl}
        title="Google Maps"
        src={embedUrl}
        className={`${className} border-0 block w-full`}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={() => setIsLoaded(true)}
      />

      {/* Google Maps Attribution & Link Badge */}
      <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1.5">
        <a
          href={externalGoogleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[10px] font-semibold text-slate-700 shadow-xs border border-slate-200 hover:text-emerald-700 hover:bg-white transition backdrop-blur-xs"
        >
          <MapPin className="h-3 w-3 text-red-500" />
          <span>Open in Google Maps</span>
          <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
        </a>
      </div>
    </div>
  );
}
