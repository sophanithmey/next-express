import { z } from 'zod';
import { isValidCambodiaPhoneNumber } from '@/lib/phone-number';

export const phoneSchema = z.object({
  phoneNumber: z
    .string({ required_error: 'Phone number is required' })
    .min(1, 'Phone number is required')
    .refine((val) => isValidCambodiaPhoneNumber(val), {
      message: 'Please enter a valid Cambodian phone number (e.g. 012 345 678)',
    }),
});

export type PhoneFormValues = z.infer<typeof phoneSchema>;

export const pinSchema = z.object({
  pin: z
    .string()
    .length(4, 'PIN must be exactly 4 digits')
    .regex(/^[0-9]+$/, 'PIN must only contain digits'),
});

export type PinFormValues = z.infer<typeof pinSchema>;

export const verifyPinPayloadSchema = z.object({
  phoneNumber: phoneSchema.shape.phoneNumber,
  pin: pinSchema.shape.pin,
});

export const otpRequestSchema = z.object({
  phoneNumber: phoneSchema.shape.phoneNumber,
});

export const pinSetupSchema = z.object({
  newPin: pinSchema.shape.pin,
});

export const pinResetSchema = z.object({
  phoneNumber: phoneSchema.shape.phoneNumber,
  otpCode: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^[0-9]+$/, 'OTP must only contain digits'),
  newPin: pinSchema.shape.pin,
});
