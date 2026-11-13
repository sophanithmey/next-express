import { GeoCoordinates } from '@/features/booking/types/booking-types';
import {
  GoogleAdvancedMarkerElement,
  GoogleClassicMarkerInstance,
  GoogleLatLng,
  GoogleLatLngLiteral,
  GoogleMapInstance,
  GoogleMapsEventListener,
  GoogleMapsNamespace,
} from './google-maps-types';

export interface InteractiveMarkerHandle {
  setPosition: (pos: GeoCoordinates) => void;
  cleanup: () => void;
}

export function toNumericCoords(
  latLng: GoogleLatLng | GoogleLatLngLiteral | null | undefined,
): GeoCoordinates | null {
  if (!latLng) return null;
  const rawLat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
  const rawLng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;
  if (!Number.isFinite(rawLat) || !Number.isFinite(rawLng)) return null;
  return { lat: Number(rawLat.toFixed(6)), lng: Number(rawLng.toFixed(6)) };
}

/**
 * Mounts an AdvancedMarkerElement when available and supported,
 * falling back to classic google.maps.Marker with drag support otherwise.
 */
export function createDraggableMarker(
  maps: GoogleMapsNamespace,
  map: GoogleMapInstance,
  position: GeoCoordinates,
  title: string,
  onDragEnd: (coords: GeoCoordinates) => void,
): InteractiveMarkerHandle {
  let advMarker: GoogleAdvancedMarkerElement | null = null;
  let classicMarker: GoogleClassicMarkerInstance | null = null;
  let dragListener: GoogleMapsEventListener | null = null;

  const AdvMarker = maps.marker?.AdvancedMarkerElement;
  if (AdvMarker) {
    try {
      advMarker = new AdvMarker({
        map,
        position: { lat: position.lat, lng: position.lng },
        gmpDraggable: true,
        title,
      });
      dragListener = advMarker.addListener('dragend', (evt) => {
        const next = toNumericCoords(evt.latLng) || toNumericCoords(advMarker?.position);
        if (next) onDragEnd(next);
      });
    } catch {
      advMarker = null;
    }
  }

  if (!advMarker && maps.Marker) {
    classicMarker = new maps.Marker({
      map,
      position: { lat: position.lat, lng: position.lng },
      draggable: true,
      title,
    });
    dragListener = classicMarker.addListener('dragend', (evt) => {
      const next =
        toNumericCoords(evt.latLng) || toNumericCoords(classicMarker?.getPosition());
      if (next) onDragEnd(next);
    });
  }

  return {
    setPosition(pos: GeoCoordinates) {
      if (advMarker) advMarker.position = pos;
      if (classicMarker) classicMarker.setPosition(pos);
    },
    cleanup() {
      dragListener?.remove();
      if (advMarker) advMarker.map = null;
      if (classicMarker) classicMarker.setMap(null);
      advMarker = null;
      classicMarker = null;
    },
  };
}

