import { clientAxios, withAcceptLanguage } from '@/lib/axios/client-axios';
import { isLocalDemoStorageEnabled } from '@/lib/local-demo-storage';
import { CreateSavedLocationInput } from '../schemas/location-schema';
import { GeoCoordinates, SavedLocationItem } from '../types/booking-types';
import { localDemoLocationStore } from './local-demo-location-store';

export interface ResolvedMapLocation {
  coordinates: GeoCoordinates;
  placeName?: string;
  address: string;
  resolvedUrl: string;
}

export const locationApiService = {
  async listLocations(params?: {
    lat?: number;
    lng?: number;
    locale?: string;
  }): Promise<SavedLocationItem[]> {
    if (isLocalDemoStorageEnabled()) {
      return localDemoLocationStore.listLocations();
    }

    const query: Record<string, string | number> = {};
    if (params?.lat && params?.lng) {
      query.lat = params.lat;
      query.lng = params.lng;
    }
    if (params?.locale) {
      query.lang = params.locale;
    }

    const response = await clientAxios.get<SavedLocationItem[]>(
      '/locations',
      withAcceptLanguage(params?.locale, { params: query }),
    );
    return Array.isArray(response.data) ? response.data : [];
  },

  async createLocation(
    input: CreateSavedLocationInput,
    locale?: string,
  ): Promise<SavedLocationItem> {
    if (isLocalDemoStorageEnabled()) {
      return localDemoLocationStore.createLocation(input);
    }

    const response = await clientAxios.post<SavedLocationItem>(
      '/locations',
      input,
      withAcceptLanguage(locale),
    );
    return response.data;
  },

  async resolveGoogleMapsLink(
    input: string,
    signal?: AbortSignal,
  ): Promise<ResolvedMapLocation> {
    const response = await clientAxios.post<ResolvedMapLocation>(
      '/locations/resolve',
      { input },
      { signal },
    );
    return response.data;
  },
};

