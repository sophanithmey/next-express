'use client';

import React, { useMemo, useState } from 'react';
import { GeoCoordinates } from '@/features/booking/types/booking-types';
import { MapPin, ExternalLink } from 'lucide-react';

interface DeliveryMapProps {
  pickupCoords?: GeoCoordinates;
  dropoffCoords?: GeoCoordinates;
  waypoints?: GeoCoordinates[];
  isDraggableDropoff?: boolean;
  onDropoffChange?: (coords: GeoCoordinates) => void;
  className?: string;
  zoom?: number;
}

const DEFAULT_CENTER: GeoCoordinates = { lat: 11.5564, lng: 104.9282 }; // Phnom Penh Central

export function DeliveryMap({
  pickupCoords,
  dropoffCoords,
  waypoints,
  className = 'h-72 w-full',
  zoom = 15,
}: DeliveryMapProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const routeStops = useMemo(() => {
    if (waypoints && waypoints.length > 0) return waypoints;
    return dropoffCoords ? [dropoffCoords] : [];
  }, [waypoints, dropoffCoords]);

  // Determine Google Maps embed URL
  const embedUrl = useMemo(() => {
    if (pickupCoords && routeStops.length > 0) {
      const saddr = `${pickupCoords.lat},${pickupCoords.lng}`;
      const [first, ...rest] = routeStops;
      const baseDaddr = encodeURIComponent(`${first.lat},${first.lng}`);
      const extraDaddr = rest
        .map((c) => `+to:${encodeURIComponent(`${c.lat},${c.lng}`)}`)
        .join('');
      return `https://www.google.com/maps?saddr=${encodeURIComponent(saddr)}&daddr=${baseDaddr}${extraDaddr}&output=embed`;
    }

    // Single location pin (drop-off or pickup)
    const target = routeStops[0] || pickupCoords || DEFAULT_CENTER;
    return `https://www.google.com/maps?q=${target.lat},${target.lng}&z=${zoom}&output=embed`;
  }, [pickupCoords, routeStops, zoom]);

  const activeCoords = routeStops[0] || pickupCoords || DEFAULT_CENTER;
  const externalGoogleMapsUrl = useMemo(() => {
    if (pickupCoords && routeStops.length > 0) {
      const points = [pickupCoords, ...routeStops]
        .map((c) => `${c.lat},${c.lng}`)
        .join('/');
      return `https://www.google.com/maps/dir/${points}`;
    }
    return `https://www.google.com/maps?q=${activeCoords.lat},${activeCoords.lng}`;
  }, [pickupCoords, routeStops, activeCoords]);

  return (
    <div className='relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-2xs'>
      {!isLoaded && (
        <div className='absolute inset-0 flex items-center justify-center bg-slate-100 text-xs text-slate-400 animate-pulse z-10'>
          <div className='flex items-center gap-2'>
            <MapPin className='h-4 w-4 text-brand-600 animate-bounce' />
            <span>Loading Google Map…</span>
          </div>
        </div>
      )}

      <iframe
        key={embedUrl}
        title='Google Maps'
        src={embedUrl}
        className={`${className} border-0 block w-full`}
        loading='lazy'
        allowFullScreen
        referrerPolicy='no-referrer-when-downgrade'
        onLoad={() => setIsLoaded(true)}
      />

      {/* Google Maps Attribution & Link Badge */}
      <div className='absolute bottom-2 right-2 z-20 flex items-center gap-1.5'>
        <a
          href={externalGoogleMapsUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[10px] font-semibold text-slate-700 shadow-xs border border-slate-200 hover:text-brand-700 hover:bg-white transition backdrop-blur-xs'
        >
          <MapPin className='h-3 w-3 text-red-500' />
          <span>Open in Google Maps</span>
          <ExternalLink className='h-2.5 w-2.5 text-slate-400' />
        </a>
      </div>
    </div>
  );
}
