import 'server-only';

export type LocalizedTextInput =
  | string
  | Record<string, unknown>
  | null
  | undefined;

export interface RawPaymentOptionRecord {
  id?: string | null;
  title?: LocalizedTextInput;
  subtitle?: LocalizedTextInput;
  logo_path?: string | null;
  logoPath?: string | null;
  subtitle_images?: unknown;
  subtitleImages?: unknown;
  subtitle_image?: unknown;
  subtitleImage?: unknown;
  provider_code?: string | null;
  providerCode?: string | null;
  is_default?: boolean | null;
  isDefault?: boolean | null;
  subtitle_display_option?: string | null;
  subtitleDisplayOption?: string | null;
  is_available?: boolean | null;
  isAvailable?: boolean | null;
  unavailable_reason?: LocalizedTextInput;
  unavailableReason?: LocalizedTextInput;
}

export interface RawPaymentAvailabilityRecord {
  is_available?: boolean | null;
  unavailable_reason?: LocalizedTextInput;
}

export interface RawPaymentCardRecord {
  id?: string | null;
  masked_card?: string | null;
  is_default?: boolean | null;
  card_scheme?: string | null;
  issuer?: string | null;
}

export interface RawPaymentTransactionRecord {
  id?: string | null;
  provider_id?: string | null;
  internal_reference?: string | null;
  core_reference?: string | null;
  amount?: string | number | null;
  currency?: string | null;
  debit_account?: string | null;
  credit_account?: string | null;
  remark?: string | null;
  payment_type?: string | null;
  transaction_status?: string | null;
}

export interface RawPaymentDetailRecord {
  id?: string | null;
  payment_status?: string | null;
  total_amount?: string | number | null;
  paid_amount?: string | number | null;
  currency?: string | null;
  payment_transactions?: RawPaymentTransactionRecord[] | null;
}

