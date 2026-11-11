import 'server-only';
import {
  PaymentAvailabilityResult,
  PaymentCardItem,
  PaymentDetailRecord,
  PaymentOptionItem,
  PaymentTransactionItem,
} from '@/features/payment/types/payment-types';

export type LocalizedTextInput = string | Record<string, unknown> | null | undefined;

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

const LANGUAGE_KEYS = new Set(['en', 'km', 'zh', 'kh']);

/**
 * Resolves a localized string or map (`{ en, km, ... }`) into display text.
 */
export function resolveLocalizedText(
  value: LocalizedTextInput,
  acceptLanguage = 'EN',
): string {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value !== 'object') return '';

  const entries = Object.entries(value)
    .map(([key, val]) => [key, typeof val === 'string' ? val.trim() : ''] as const)
    .filter(([, val]) => val.length > 0);

  if (entries.length === 0) return '';

  const targetLower = acceptLanguage.slice(0, 2).toLowerCase();
  const preferredKeys = [targetLower, targetLower.toUpperCase(), 'en', 'EN', 'km', 'KM'];

  for (const preferred of preferredKeys) {
    const match = entries.find(([key]) => key === preferred);
    if (match) return match[1];
  }

  const hasLanguageKeys = entries.some(([key]) => LANGUAGE_KEYS.has(key.toLowerCase()));
  if (hasLanguageKeys) return entries[0][1];

  return entries.map(([, val]) => val).join(' • ');
}

function extractSubtitleImages(raw: RawPaymentOptionRecord): string[] {
  const candidates = [
    raw.subtitle_images,
    raw.subtitleImages,
    raw.subtitle_image,
    raw.subtitleImage,
  ];
  const collected: string[] = [];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        if (typeof item === 'string' && item.trim().length > 0) {
          collected.push(item.trim());
        }
      }
    } else if (typeof candidate === 'string' && candidate.trim().length > 0) {
      collected.push(candidate.trim());
    }
  }

  return Array.from(new Set(collected));
}

export function mapPaymentOptionRecord(
  raw: RawPaymentOptionRecord,
  acceptLanguage = 'EN',
): PaymentOptionItem {
  const providerCode =
    raw.provider_code?.trim() || raw.providerCode?.trim() || raw.id?.trim() || 'khqr';
  const title = resolveLocalizedText(raw.title, acceptLanguage) || providerCode;
  const subtitle = resolveLocalizedText(raw.subtitle, acceptLanguage) || undefined;
  const unavailableReason =
    resolveLocalizedText(
      raw.unavailable_reason ?? raw.unavailableReason,
      acceptLanguage,
    ) || undefined;
  const logoPath = raw.logo_path?.trim() || raw.logoPath?.trim() || undefined;
  const subtitleImages = extractSubtitleImages(raw);
  const isDefault = Boolean(raw.is_default ?? raw.isDefault);
  const isAvailable = (raw.is_available ?? raw.isAvailable) !== false;
  const subtitleDisplayOption =
    raw.subtitle_display_option?.trim() || raw.subtitleDisplayOption?.trim() || undefined;

  return {
    id: raw.id?.trim() || providerCode,
    providerCode,
    title,
    subtitle,
    logoPath,
    subtitleImages,
    subtitleDisplayOption,
    isDefault,
    isAvailable,
    unavailableReason,
  };
}

export function mapPaymentOptionList(
  body: unknown,
  acceptLanguage = 'EN',
): PaymentOptionItem[] {
  const list: RawPaymentOptionRecord[] = Array.isArray(body)
    ? (body as RawPaymentOptionRecord[])
    : body &&
        typeof body === 'object' &&
        Array.isArray((body as { content?: unknown }).content)
      ? ((body as { content: RawPaymentOptionRecord[] }).content)
      : [];

  return list.map((item) => mapPaymentOptionRecord(item, acceptLanguage));
}

export function mapPaymentAvailability(
  body: unknown,
  providerCode: string,
  serviceType: string,
  acceptLanguage = 'EN',
): PaymentAvailabilityResult {
  const record =
    body && typeof body === 'object' ? (body as RawPaymentAvailabilityRecord) : {};

  return {
    providerCode,
    serviceType,
    isAvailable: record.is_available !== false,
    unavailableReason:
      resolveLocalizedText(record.unavailable_reason, acceptLanguage) || undefined,
  };
}

export function mapPaymentCardList(body: unknown): PaymentCardItem[] {
  const list = Array.isArray(body) ? (body as RawPaymentCardRecord[]) : [];
  return list
    .filter((card) => Boolean(card?.id))
    .map((card) => ({
      id: card.id!.trim(),
      maskedCard: card.masked_card?.trim() || '•••• ••••',
      isDefault: Boolean(card.is_default),
      cardScheme: card.card_scheme?.trim() || 'CARD',
      issuer: card.issuer?.trim() || 'Bank Card',
    }));
}

function toDisplayAmount(value: string | number | null | undefined): string {
  if (typeof value === 'number' && Number.isFinite(value)) return value.toFixed(2);
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  return '0.00';
}

export function mapPaymentDetailRecord(body: unknown): PaymentDetailRecord | null {
  if (!body || typeof body !== 'object') return null;
  const raw = body as RawPaymentDetailRecord;
  if (!raw.id) return null;

  const rawTx = Array.isArray(raw.payment_transactions) ? raw.payment_transactions : [];
  const transactions: PaymentTransactionItem[] = rawTx.map((tx, idx) => ({
    id: tx.id?.trim() || `tx-${idx + 1}`,
    providerId: tx.provider_id?.trim() || undefined,
    internalReference: tx.internal_reference?.trim() || undefined,
    coreReference: tx.core_reference?.trim() || undefined,
    amount: toDisplayAmount(tx.amount),
    currency: tx.currency?.trim() || raw.currency?.trim() || 'USD',
    debitAccount: tx.debit_account?.trim() || undefined,
    creditAccount: tx.credit_account?.trim() || undefined,
    remark: tx.remark?.trim() || undefined,
    paymentType: tx.payment_type?.trim() || undefined,
    transactionStatus: tx.transaction_status?.trim() || undefined,
  }));

  return {
    id: raw.id.trim(),
    paymentStatus: raw.payment_status?.trim() || 'PENDING',
    totalAmount: toDisplayAmount(raw.total_amount),
    paidAmount: toDisplayAmount(raw.paid_amount),
    currency: raw.currency?.trim() || 'USD',
    transactions,
  };
}

