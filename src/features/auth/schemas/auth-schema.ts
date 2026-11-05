import { z } from 'zod';

export const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(8, 'Phone number must be at least 8 digits')
    .max(15, 'Phone number cannot exceed 15 digits')
    .regex(/^[0-9\s+-]+$/, 'Phone number can only contain digits, spaces, and hyphens'),
});

export type PhoneFormValues = z.infer<typeof phoneSchema>;

export const pinSchema = z.object({
  pin: z
    .string()
    .length(4, 'PIN must be exactly 4 digits')
    .regex(/^[0-9]+$/, 'PIN must only contain digits'),
});

export type PinFormValues = z.infer<typeof pinSchema>;
