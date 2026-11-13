'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GeoCoordinates } from '@/features/booking/types/booking-types';
import {
  GoogleMapInstance,
  GoogleMapsErrorCode,
  GoogleMapsLoadError,
  GoogleMapsNamespace,
  getGoogleMapsMapId,
  loadGoogleMapsApi,
} from '@/lib/google-maps/google-maps-loader';
import {
  InteractiveMarkerHandle,
  createDraggableMarker,
  toNumericCoords,
} from '@/lib/google-maps/google-maps-marker';

interface UseLocationMapParams {
  coordinates: GeoCoordinates;
  markerTitle: string;
  onSelectCoordinates: (coords: GeoCoordinates) => void;
}

const DEFAULT_ZOOM = 16;

/**
 * Manages interactive Google Map lifecycle, draggable pin synchronization,
 * click-to-move selection, recentering, and fallback error classification.
 */
export function useLocationMap({
  coordinates,
  markerTitle,
  onSelectCoordinates,
}: UseLocationMapParams) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const markerRef = useRef<InteractiveMarkerHandle | null>(null);
  const onSelectRef = useRef(onSelectCoordinates);
  onSelectRef.current = onSelectCoordinates;

  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [fallbackCode, setFallbackCode] =
    useState<GoogleMapsErrorCode>('SCRIPT_LOAD_ERROR');

  useEffect(() => {
    let active = true;
    let mapInstance: GoogleMapInstance | null = null;
    let mapsNamespace: GoogleMapsNamespace | null = null;
    let clickListener: { remove: () => void } | null = null;

    loadGoogleMapsApi()
      .then((maps) => {
        if (!active || !containerRef.current) return;
        mapsNamespace = maps;
        mapInstance = new maps.Map(containerRef.current, {
          center: { lat: coordinates.lat, lng: coordinates.lng },
          zoom: DEFAULT_ZOOM,
          mapId: getGoogleMapsMapId() || undefined,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy',
        });
        mapRef.current = mapInstance;

        markerRef.current = createDraggableMarker(
          maps,
          mapInstance,
          coordinates,
          markerTitle,
          (next) => onSelectRef.current(next),
        );

        clickListener = mapInstance.addListener('click', (evt) => {
          const next = toNumericCoords(evt.latLng);
          if (!next) return;
          markerRef.current?.setPosition(next);
          onSelectRef.current(next);
        });

        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (!active) return;
        setFallbackCode(
          error instanceof GoogleMapsLoadError ? error.code : 'SCRIPT_LOAD_ERROR',
        );
        setStatus('fallback');
      });

    return () => {
      active = false;
      clickListener?.remove();
      markerRef.current?.cleanup();
      markerRef.current = null;
      if (mapsNamespace?.event && mapInstance) {
        mapsNamespace.event.clearInstanceListeners(mapInstance);
      }
      mapRef.current = null;
    };
    // Mounts once per map instance; external coordinate updates pan/move marker below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const pos = { lat: coordinates.lat, lng: coordinates.lng };
    markerRef.current?.setPosition(pos);
    mapRef.current?.panTo(pos);
  }, [coordinates.lat, coordinates.lng]);

  const handleCenterOnMarker = useCallback(() => {
    mapRef.current?.panTo({ lat: coordinates.lat, lng: coordinates.lng });
    mapRef.current?.setZoom(DEFAULT_ZOOM);
  }, [coordinates.lat, coordinates.lng]);

  const handleZoomIn = useCallback(() => {
    const current = mapRef.current?.getZoom() ?? DEFAULT_ZOOM;
    mapRef.current?.setZoom(Math.min(20, current + 1));
  }, []);

  const handleZoomOut = useCallback(() => {
    const current = mapRef.current?.getZoom() ?? DEFAULT_ZOOM;
    mapRef.current?.setZoom(Math.max(10, current - 1));
  }, []);

  return {
    containerRef,
    status,
    fallbackCode,
    handleCenterOnMarker,
    handleZoomIn,
    handleZoomOut,
  };
}

