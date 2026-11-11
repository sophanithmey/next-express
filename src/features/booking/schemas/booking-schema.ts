import { z } from 'zod';
import { isValidCambodiaPhoneNumber } from '@/lib/phone-number';

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const pickupSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Pickup location name is required'),
  address: z.string().min(5, 'Pickup address is required'),
  coordinates: coordinatesSchema,
  senderName: z.string().optional(),
  senderPhone: z
    .string({ required_error: 'Pickup contact phone number is required' })
    .min(1, 'Pickup contact phone number is required')
    .refine(
      (val) => isValidCambodiaPhoneNumber(val),
      { message: 'Please enter a valid Cambodian phone number (e.g. 012 888 999)' }
    ),
  isDefault: z.boolean().optional(),
});

export const recipientSchema = z.object({
  name: z.string().optional().default(''),
  phoneNumber: z
    .string({ required_error: 'Recipient phone number is required' })
    .min(1, 'Recipient phone number is required')
    .refine(
      (val) => isValidCambodiaPhoneNumber(val),
      { message: 'Please enter a valid Cambodian phone number (e.g. 012 345 678)' }
    ),
  alternatePhone: z
    .string()
    .optional()
    .refine(
      (val) => !val || isValidCambodiaPhoneNumber(val),
      { message: 'Please enter a valid Cambodian phone number (e.g. 012 345 678)' }
    ),
  notes: z.string().optional(),
});

export const dropoffSchema = z.object({
  address: z.string().min(5, 'Drop-off address is required'),
  landmark: z.string().optional(),
  coordinates: coordinatesSchema,
});

export const parcelSchema = z.object({
  description: z.string().optional(),
  sellerOrderRef: z.string().optional(),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1').default(1),
  instructions: z.string().optional(),
  itemCategory: z.string().optional(),
});

export const codSchema = z
  .object({
    isCod: z.boolean().default(false),
    amount: z.coerce.number().min(0, 'COD amount cannot be negative').default(0),
  })
  .refine(
    (data) => {
      if (data.isCod) {
        return data.amount > 0;
      }
      return true;
    },
    {
      message: 'Please enter a valid COD amount greater than 0',
      path: ['amount'],
    }
  );

export const dropoffStopSchema = z.object({
  id: z.string(),
  recipient: recipientSchema,
  dropoff: dropoffSchema,
  codAmount: z.coerce
    .number()
    .min(0, 'COD amount cannot be negative')
    .optional(),
});

export const bookingFormSchema = z.object({
  pickup: pickupSchema,
  recipient: recipientSchema,
  isBookingOnBehalf: z.boolean().default(false),
  senderName: z.string().optional(),
  senderPhone: z.string().optional(),
  dropoff: dropoffSchema,
  dropoffs: z.array(dropoffStopSchema).optional(),
  deliveryOption: z.enum(['instant', 'same_day', 'scheduled']).default('instant').optional(),
  parcel: parcelSchema,
  cod: codSchema,
});

export type BookingFormSchemaValues = z.infer<typeof bookingFormSchema>;

