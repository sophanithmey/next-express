import { z } from 'zod';
import { coordinatesSchema } from './booking-schema';

export const addressDetailInputSchema = z.object({
  house_number: z.string().trim().optional(),
  street_number: z.string().trim().optional(),
  province_id: z.string().trim().optional(),
  district_id: z.string().trim().optional(),
  commune_id: z.string().trim().optional(),
  village_id: z.string().trim().optional(),
});

export const createSavedLocationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Location name is required')
    .max(80, 'Location name must be 80 characters or fewer'),
  address: z
    .string()
    .trim()
    .min(3, 'Address must be at least 3 characters'),
  coordinates: coordinatesSchema,
  type: z.string().trim().optional(),
  contact: z.string().trim().optional(),
  senderPhone: z.string().trim().optional(),
  senderName: z.string().trim().optional(),
  riderNote: z.string().trim().optional(),
  remark: z.string().trim().optional(),
  addressDetail: addressDetailInputSchema.optional(),
});

export type AddressDetailInput = z.infer<typeof addressDetailInputSchema>;
export type CreateSavedLocationInput = z.infer<typeof createSavedLocationSchema>;

