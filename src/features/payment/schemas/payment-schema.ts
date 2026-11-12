import { z } from 'zod';

export const createPaymentCardSchema = z.object({
  platform: z.string().trim().min(1).optional(),
  provider: z.string().trim().min(1, 'Provider is required'),
  serviceCode: z.string().trim().min(1).optional(),
  service_code: z.string().trim().min(1).optional(),
});

export const updatePaymentCardSettingSchema = z
  .object({
    isDefault: z.boolean().optional(),
    is_default: z.boolean().optional(),
  })
  .refine(
    (val) => typeof val.isDefault === 'boolean' || typeof val.is_default === 'boolean',
    { message: 'isDefault boolean is required' },
  );

