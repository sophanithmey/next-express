import 'server-only';
import { PickupLocation } from '@/features/booking/types/booking-types';
import { CreateSavedLocationInput } from '@/features/booking/schemas/location-schema';
import { SessionData } from '@/features/auth/types/auth-types';
import {
  SavedLocationOption,
  wingAddressIntegration,
} from '@/server/integrations/wing-address-integration';
import { wingExpressIntegration } from '@/server/integrations/wing-express-integration';
import {
  ResolvedMapLocation,
  googleMapsIntegration,
} from '@/server/integrations/google-maps-integration';
import { ConsumerApiError } from '@/server/lib/api-response';
import { getServerEnv } from '@/server/lib/env';
import { inMemoryStore } from '@/server/lib/mock-booking-store';

export const locationServerService = {
  async listSavedLocations(params: {
    session: SessionData | null;
    acceptLanguage?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<SavedLocationOption[]> {
    const env = getServerEnv();
    if (
      !env.mockAddressApi &&
      params.session?.accessToken &&
      params.session.user?.id
    ) {
      return wingAddressIntegration.getSortedAddresses({
        accessToken: params.session.accessToken,
        referenceId: params.session.user.id,
        latitude:
          params.latitude && Number.isFinite(params.latitude)
            ? params.latitude
            : undefined,
        longitude:
          params.longitude && Number.isFinite(params.longitude)
            ? params.longitude
            : undefined,
        acceptLanguage: params.acceptLanguage || 'EN',
        fallbackPhone: params.session.user.phoneNumber,
        fallbackSenderName: params.session.user.name,
      });
    }

    if (!env.mockUpstreamApi) {
      try {
        return await wingExpressIntegration.getSavedLocations(
          params.session?.accessToken,
        );
      } catch {
        // Fallback to mock store
      }
    }

    return inMemoryStore.getLocations();
  },

  async createSavedLocation(params: {
    data: CreateSavedLocationInput;
    session: SessionData | null;
    acceptLanguage?: string;
  }): Promise<SavedLocationOption> {
    const env = getServerEnv();
    const { data, session } = params;
    const contact =
      data.contact || data.senderPhone || session?.user?.phoneNumber;
    const remark = data.remark || data.riderNote;

    if (!env.mockAddressApi) {
      if (!session?.accessToken || !session.user?.id) {
        throw new ConsumerApiError(
          'Please sign in to save a new location.',
          401,
        );
      }

      return wingAddressIntegration.createAddress({
        accessToken: session.accessToken,
        referenceId: session.user.id,
        name: data.name,
        informationAddress: data.address,
        latitude: data.coordinates.lat,
        longitude: data.coordinates.lng,
        type: data.type,
        contact,
        remark,
        metadata: data.senderName ? { contact_name: data.senderName } : undefined,
        addressDetail: data.addressDetail,
        acceptLanguage: params.acceptLanguage || 'EN',
        fallbackPhone: session.user.phoneNumber,
        fallbackSenderName: session.user.name,
      });
    }

    const locInput: PickupLocation = {
      name: data.name,
      address: data.address,
      coordinates: data.coordinates,
      senderPhone: contact,
      senderName: data.senderName || session?.user?.name,
      riderNote: remark,
    };

    const saved = !env.mockUpstreamApi
      ? await wingExpressIntegration
          .savePickupLocation(locInput, session?.accessToken)
          .catch(() => inMemoryStore.addLocation(locInput))
      : inMemoryStore.addLocation(locInput);

    return { ...saved, tag: data.type || 'consumer' };
  },

  async resolveMapLocationInput(input: string): Promise<ResolvedMapLocation> {
    return googleMapsIntegration.resolveLocationInput(input);
  },
};

