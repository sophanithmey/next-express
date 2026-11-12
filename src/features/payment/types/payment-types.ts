export interface PaymentOptionItem {
  id: string;
  providerCode: string;
  title: string;
  subtitle?: string;
  logoPath?: string;
  subtitleImages: string[];
  subtitleDisplayOption?: string;
  isDefault: boolean;
  isAvailable: boolean;
  unavailableReason?: string;
}

export interface PaymentAvailabilityResult {
  providerCode: string;
  serviceType: string;
  isAvailable: boolean;
  unavailableReason?: string;
}

export interface PaymentCardItem {
  id: string;
  maskedCard: string;
  isDefault: boolean;
  cardScheme: string;
  issuer: string;
}

export interface CreatePaymentCardPayload {
  platform?: string;
  provider: string;
  serviceCode?: string;
}

export interface CreatePaymentCardResult {
  card?: PaymentCardItem;
  redirectUrl?: string;
}

export interface PaymentTransactionItem {
  id: string;
  providerId?: string;
  internalReference?: string;
  coreReference?: string;
  amount: string;
  currency: string;
  debitAccount?: string;
  creditAccount?: string;
  remark?: string;
  paymentType?: string;
  transactionStatus?: string;
}

export interface PaymentDetailRecord {
  id: string;
  paymentStatus: string;
  totalAmount: string;
  paidAmount: string;
  currency: string;
  transactions: PaymentTransactionItem[];
}

