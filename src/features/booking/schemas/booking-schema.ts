import { z } from 'zod';
import { APP_CONFIG, MAX_DROPOFF_STOPS, MAX_TOTAL_COD_USD } from '@/lib/constants';
import { isValidCambodiaPhoneNumber } from '@/lib/phone-number';
import { isValidWingAccountNumber } from '@/features/booking/services/booking-form-helpers';

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
    .refine((val) => isValidCambodiaPhoneNumber(val), {
      message: 'Please enter a valid Cambodian phone number (e.g. 012 888 999)',
    }),
  riderNote: z.string().optional(),
  imageUrl: z.string().optional(),
  settlementBank: z.string().optional(),
  settlementAccountName: z.string().optional(),
  settlementAccountNumber: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const recipientSchema = z.object({
  name: z.string().optional().default(''),
  phoneNumber: z
    .string({ required_error: 'Recipient phone number is required' })
    .min(1, 'Recipient phone number is required')
    .refine((val) => isValidCambodiaPhoneNumber(val), {
      message: 'Please enter a valid Cambodian phone number (e.g. 012 345 678)',
    }),
  alternatePhone: z
    .string()
    .optional()
    .refine((val) => !val || isValidCambodiaPhoneNumber(val), {
      message: 'Please enter a valid Cambodian phone number (e.g. 012 345 678)',
    }),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const dropoffSchema = z.object({
  addressId: z.string().optional(),
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
  .refine((data) => (data.isCod ? data.amount > 0 : true), {
    message: 'Please enter a valid COD amount greater than 0',
    path: ['amount'],
  })
  .refine((data) => !data.isCod || data.amount <= MAX_TOTAL_COD_USD, {
    message: `Total COD across all drop-off points cannot exceed $${MAX_TOTAL_COD_USD} USD`,
    path: ['amount'],
  });

export const dropoffStopSchema = z.object({
  id: z.string(),
  recipient: recipientSchema,
  dropoff: dropoffSchema,
  codAmount: z.coerce.number().min(0, 'COD amount cannot be negative').optional(),
  parcelNote: z.string().optional(),
  imageUrl: z.string().optional(),
});

interface WingBankCodCheckInput {
  pickup: {
    settlementAccountName?: string;
    settlementAccountNumber?: string;
  };
  dropoffs?: Array<{ codAmount?: number }>;
  cod: {
    isCod: boolean;
    amount: number;
  };
}

function validateWingBankCodRequirement(
  data: WingBankCodCheckInput,
  ctx: z.RefinementCtx,
) {
  const hasExplicitStopCod = Boolean(
    data.dropoffs?.some((s) => typeof s.codAmount === 'number'),
  );
  const stopCodTotal =
    data.dropoffs?.reduce((sum, s) => sum + Math.max(0, Number(s.codAmount) || 0), 0) ?? 0;
  const roundedStopCod = Math.round(stopCodTotal * 100) / 100;
  const effectiveTotalCod = hasExplicitStopCod
    ? roundedStopCod
    : data.cod.isCod
      ? data.cod.amount
      : 0;

  if (effectiveTotalCod > MAX_TOTAL_COD_USD) {
    const maxMessage = `Total COD across all drop-off points cannot exceed $${MAX_TOTAL_COD_USD} USD`;
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cod', 'amount'],
      message: maxMessage,
    });
    data.dropoffs?.forEach((stop, idx) => {
      if ((stop.codAmount ?? 0) > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dropoffs', idx, 'codAmount'],
          message: maxMessage,
        });
      }
    });
  }

  const hasStopCod = Boolean(data.dropoffs?.some((s) => (s.codAmount ?? 0) > 0));
  const isCodActive = hasStopCod || (data.cod.isCod && data.cod.amount > 0);
  const accountName = data.pickup.settlementAccountName?.trim() ?? '';
  const accountNumber = data.pickup.settlementAccountNumber?.trim() ?? '';

  if (isCodActive) {
    if (accountName.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pickup', 'settlementAccountName'],
        message: 'Wing Bank account name is required for COD deliveries',
      });
    }
    if (!isValidWingAccountNumber(accountNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pickup', 'settlementAccountNumber'],
        message: 'Please enter a valid Wing Bank account number (5-20 digits)',
      });
    }
    return;
  }

  if (accountNumber && !isValidWingAccountNumber(accountNumber)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['pickup', 'settlementAccountNumber'],
      message: 'Please enter a valid Wing Bank account number (5-20 digits)',
    });
  }
}

const bookingFormBaseSchema = z.object({
  pickup: pickupSchema,
  recipient: recipientSchema,
  isBookingOnBehalf: z.boolean().default(false),
  senderName: z.string().optional(),
  senderPhone: z.string().optional(),
  dropoff: dropoffSchema,
  dropoffs: z
    .array(dropoffStopSchema)
    .max(
      MAX_DROPOFF_STOPS,
      `Maximum ${MAX_DROPOFF_STOPS} drop-off points allowed per booking`,
    )
    .optional(),
  deliveryOption: z
    .enum(['instant', 'same_day', 'scheduled'])
    .default('instant')
    .optional(),
  parcel: parcelSchema,
  cod: codSchema,
});

export const bookingFormSchema = bookingFormBaseSchema.superRefine(
  validateWingBankCodRequirement,
);

export type BookingFormSchemaValues = z.infer<typeof bookingFormSchema>;

export const createBookingRequestSchema = bookingFormBaseSchema
  .extend({
    draftOrderId: z.string().optional(),
    trackingNumber: z.string().optional(),
    paymentMethod: z.string().optional(),
    paymentCardId: z.string().optional(),
    promoCode: z.string().optional(),
    discountAmount: z.number().optional(),
    tipAmount: z.number().optional(),
    finalFee: z.number().optional(),
    isDraft: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isDraft) {
      validateWingBankCodRequirement(data, ctx);
    }
  });

export const feeCalculationSchema = z.object({
  pickup: coordinatesSchema,
  dropoff: coordinatesSchema,
  additionalStopsCount: z.number().int().min(0).optional(),
  deliveryOption: z.enum(['instant', 'same_day', 'scheduled']).optional(),
});

export const bookingPatchSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('cancel'),
    reason: z.string().optional(),
  }),
  z.object({
    action: z.literal('checkout'),
    metadata: z.record(z.unknown()).optional(),
  }),
]);

export const bookingDraftRequestSchema = z.object({
  draftOrderId: z.string().optional(),
  pickup: z.object({
    id: z.string().optional(),
    name: z.string().optional().default('Pickup Origin'),
    address: z.string().optional().default(''),
    coordinates: coordinatesSchema.optional().default(APP_CONFIG.defaultCoordinates),
    senderName: z.string().optional(),
    senderPhone: z.string().optional(),
    riderNote: z.string().optional(),
    imageUrl: z.string().optional(),
    settlementBank: z.string().optional(),
    settlementAccountName: z.string().optional(),
    settlementAccountNumber: z.string().optional(),
  }),
  dropoff: z.object({
    addressId: z.string().optional(),
    address: z.string().optional().default(''),
    coordinates: coordinatesSchema.optional().default(APP_CONFIG.defaultCoordinates),
  }),
  recipient: z.object({
    name: z.string().optional().default(''),
    phoneNumber: z.string().optional().default(''),
    notes: z.string().optional(),
    imageUrl: z.string().optional(),
  }),
  dropoffs: z.array(dropoffStopSchema).optional(),
  deliveryOption: z
    .enum(['instant', 'same_day', 'scheduled'])
    .optional()
    .default('instant'),
  parcel: parcelSchema.partial().optional().default({}),
  cod: z
    .object({
      isCod: z.boolean().default(false),
      amount: z.coerce.number().min(0).default(0),
    })
    .optional()
    .default({ isCod: false, amount: 0 }),
});
