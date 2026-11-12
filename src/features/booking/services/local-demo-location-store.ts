import {
  DEMO_STORAGE_KEYS,
  readStoredDemoArray,
  writeStoredDemoArray,
} from '@/lib/local-demo-storage';
import { DEMO_SAVED_LOCATIONS } from '../data/demo-seed-data';
import { CreateSavedLocationInput } from '../schemas/location-schema';
import { SavedLocationItem } from '../types/booking-types';

export const localDemoLocationStore = {
  listLocations(): SavedLocationItem[] {
    return readStoredDemoArray<SavedLocationItem>(DEMO_STORAGE_KEYS.locations, () => [
      ...DEMO_SAVED_LOCATIONS,
    ]);
  },

  createLocation(input: CreateSavedLocationInput): SavedLocationItem {
    const created: SavedLocationItem = {
      id: `loc-${Date.now()}`,
      name: input.name,
      address: input.address,
      coordinates: input.coordinates,
      senderName: input.senderName,
      senderPhone: input.senderPhone || input.contact,
      riderNote: input.riderNote || input.remark,
      tag: input.type,
      isDefault: false,
    };
    writeStoredDemoArray(DEMO_STORAGE_KEYS.locations, [
      created,
      ...this.listLocations(),
    ]);
    return created;
  },
};

