export interface GoogleLatLng {
  lat: () => number;
  lng: () => number;
}

export interface GoogleLatLngLiteral {
  lat: number;
  lng: number;
}

export interface GoogleMapsEventListener {
  remove: () => void;
}

export interface GoogleMapMouseEvent {
  latLng: GoogleLatLng | null;
}

export interface GoogleMapRestrictionOptions {
  latLngBounds: {
    north: number;
    south: number;
    west: number;
    east: number;
  };
  strictBounds?: boolean;
}

export interface GoogleMapOptions {
  center: GoogleLatLngLiteral;
  zoom: number;
  mapId?: string;
  disableDefaultUI?: boolean;
  zoomControl?: boolean;
  streetViewControl?: boolean;
  mapTypeControl?: boolean;
  fullscreenControl?: boolean;
  gestureHandling?: 'cooperative' | 'greedy' | 'none' | 'auto';
  clickableIcons?: boolean;
  restriction?: GoogleMapRestrictionOptions;
}

export interface GoogleMapInstance {
  panTo: (latLng: GoogleLatLngLiteral) => void;
  setCenter: (latLng: GoogleLatLngLiteral) => void;
  setZoom: (zoom: number) => void;
  getZoom: () => number | undefined;
  addListener: (
    eventName: string,
    handler: (event: GoogleMapMouseEvent) => void,
  ) => GoogleMapsEventListener;
}

export interface GoogleAdvancedMarkerOptions {
  map: GoogleMapInstance | null;
  position: GoogleLatLngLiteral;
  gmpDraggable?: boolean;
  title?: string;
}

export interface GoogleAdvancedMarkerElement {
  position: GoogleLatLngLiteral | GoogleLatLng | null;
  map: GoogleMapInstance | null;
  addListener: (
    eventName: string,
    handler: (event: GoogleMapMouseEvent) => void,
  ) => GoogleMapsEventListener;
}

export interface GoogleClassicMarkerOptions {
  map: GoogleMapInstance | null;
  position: GoogleLatLngLiteral;
  draggable?: boolean;
  title?: string;
}

export interface GoogleClassicMarkerInstance {
  setPosition: (latLng: GoogleLatLngLiteral) => void;
  setMap: (map: GoogleMapInstance | null) => void;
  getPosition: () => GoogleLatLng | null;
  addListener: (
    eventName: string,
    handler: (event: GoogleMapMouseEvent) => void,
  ) => GoogleMapsEventListener;
}

export interface GoogleAutocompletePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
}

export interface GooglePlaceGeometry {
  location?: GoogleLatLng;
}

export interface GooglePlaceResult {
  place_id?: string;
  name?: string;
  formatted_address?: string;
  geometry?: GooglePlaceGeometry;
}

export interface GoogleAutocompleteService {
  getPlacePredictions: (
    request: {
      input: string;
      componentRestrictions?: { country: string | string[] };
      locationBias?: GoogleLatLngLiteral | { center: GoogleLatLngLiteral; radius: number };
    },
    callback: (
      predictions: GoogleAutocompletePrediction[] | null,
      status: string,
    ) => void,
  ) => void;
}

export interface GooglePlacesService {
  getDetails: (
    request: {
      placeId: string;
      fields: string[];
    },
    callback: (result: GooglePlaceResult | null, status: string) => void,
  ) => void;
}

export interface GoogleGeocoderResult {
  formatted_address: string;
  place_id?: string;
}

export interface GoogleGeocoder {
  geocode: (
    request: { location?: GoogleLatLngLiteral; placeId?: string },
    callback: (results: GoogleGeocoderResult[] | null, status: string) => void,
  ) => void;
}

export interface GooglePolygonOptions {
  paths: GoogleLatLngLiteral[] | GoogleLatLngLiteral[][];
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  fillColor?: string;
  fillOpacity?: number;
  clickable?: boolean;
  map?: GoogleMapInstance | null;
  zIndex?: number;
}

export interface GooglePolygonInstance {
  setMap: (map: GoogleMapInstance | null) => void;
  setOptions?: (options: Partial<GooglePolygonOptions>) => void;
  addListener?: (
    eventName: string,
    handler: (event: GoogleMapMouseEvent) => void,
  ) => GoogleMapsEventListener;
}

export interface GoogleMapsNamespace {
  Map: new (
    container: HTMLElement,
    options: GoogleMapOptions,
  ) => GoogleMapInstance;
  Marker?: new (
    options: GoogleClassicMarkerOptions,
  ) => GoogleClassicMarkerInstance;
  Polygon?: new (
    options: GooglePolygonOptions,
  ) => GooglePolygonInstance;
  Geocoder?: new () => GoogleGeocoder;
  importLibrary?: (name: string) => Promise<Record<string, unknown>>;
  marker?: {
    AdvancedMarkerElement?: new (
      options: GoogleAdvancedMarkerOptions,
    ) => GoogleAdvancedMarkerElement;
  };
  places?: {
    AutocompleteService?: new () => GoogleAutocompleteService;
    PlacesService?: new (
      attrContainer: HTMLElement,
    ) => GooglePlacesService;
  };
  event?: {
    clearInstanceListeners: (instance: object) => void;
  };
}

