'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoCoordinates } from '@/features/booking/types/booking-types';

// Fix Leaflet's default marker icons in bundlers
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface DeliveryMapProps {
  pickupCoords?: GeoCoordinates;
  dropoffCoords?: GeoCoordinates;
  isDraggableDropoff?: boolean;
  onDropoffChange?: (coords: GeoCoordinates) => void;
  className?: string;
}

export function DeliveryMap({
  pickupCoords,
  dropoffCoords,
  isDraggableDropoff = true,
  onDropoffChange,
  className = 'h-72 w-full',
}: DeliveryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropoffMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter = dropoffCoords || pickupCoords || { lat: 11.5564, lng: 104.9282 };

    const map = L.map(mapContainerRef.current, {
      center: [initialCenter.lat, initialCenter.lng],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // Run once on mount

  // Update Pickup Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !pickupCoords) return;

    if (!pickupMarkerRef.current) {
      const pickupIcon = L.divIcon({
        className: 'custom-pin-pickup',
        html: `<div style="background-color: #026bc9; color: white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">P</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      pickupMarkerRef.current = L.marker([pickupCoords.lat, pickupCoords.lng], {
        icon: pickupIcon,
      }).addTo(map);
    } else {
      pickupMarkerRef.current.setLatLng([pickupCoords.lat, pickupCoords.lng]);
    }
  }, [pickupCoords]);

  // Update Drop-off Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !dropoffCoords) return;

    if (!dropoffMarkerRef.current) {
      const dropoffIcon = L.divIcon({
        className: 'custom-pin-dropoff',
        html: `<div style="background-color: #e11d48; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.35);">D</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([dropoffCoords.lat, dropoffCoords.lng], {
        icon: dropoffIcon,
        draggable: isDraggableDropoff,
      }).addTo(map);

      if (isDraggableDropoff) {
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          onDropoffChange?.({ lat: pos.lat, lng: pos.lng });
        });
      }

      dropoffMarkerRef.current = marker;
    } else {
      dropoffMarkerRef.current.setLatLng([dropoffCoords.lat, dropoffCoords.lng]);
      if (isDraggableDropoff) {
        dropoffMarkerRef.current.dragging?.enable();
      } else {
        dropoffMarkerRef.current.dragging?.disable();
      }
    }
  }, [dropoffCoords, isDraggableDropoff, onDropoffChange]);

  // Draw Route Polyline & Fit Bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pickupCoords && dropoffCoords) {
      const latlngs: [number, number][] = [
        [pickupCoords.lat, pickupCoords.lng],
        [dropoffCoords.lat, dropoffCoords.lng],
      ];

      if (!routeLineRef.current) {
        routeLineRef.current = L.polyline(latlngs, {
          color: '#026bc9',
          weight: 3,
          opacity: 0.8,
          dashArray: '6, 8',
        }).addTo(map);
      } else {
        routeLineRef.current.setLatLngs(latlngs);
      }

      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (dropoffCoords) {
      map.setView([dropoffCoords.lat, dropoffCoords.lng], 14);
    } else if (pickupCoords) {
      map.setView([pickupCoords.lat, pickupCoords.lng], 14);
    }
  }, [pickupCoords, dropoffCoords]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 shadow-sm">
      <div ref={mapContainerRef} className={className} />
      <div className="absolute bottom-2 right-2 z-[400] rounded bg-white/90 px-2 py-0.5 text-[10px] text-slate-500 shadow backdrop-blur">
        OpenStreetMap
      </div>
    </div>
  );
}

