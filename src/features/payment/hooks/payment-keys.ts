export const paymentKeys = {
  all: ['payments'] as const,
  options: (serviceType = 'ST_EXPRESS') =>
    [...paymentKeys.all, 'options', serviceType] as const,
  availability: (providerCode: string, serviceType = 'ST_EXPRESS') =>
    [...paymentKeys.all, 'availability', providerCode, serviceType] as const,
  cards: () => [...paymentKeys.all, 'cards'] as const,
  detail: (paymentId: string) => [...paymentKeys.all, 'detail', paymentId] as const,
};

