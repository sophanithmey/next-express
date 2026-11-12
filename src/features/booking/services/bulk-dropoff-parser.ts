import { DropoffStop } from '../types/booking-types';
import { MAX_DROPOFF_STOPS } from '@/lib/constants';
import { normalizePhoneNumber, isValidCambodiaPhoneNumber } from '@/lib/phone-number';

export interface ParsedBulkStop {
  id: string;
  recipientName: string;
  phoneNumber: string;
  address: string;
  codAmount?: number;
  note: string;
  isValid: boolean;
  error?: string;
}

export const SAMPLE_BULK_CSV = `Recipient Name,Recipient Phone,Drop-off Address,COD Amount,Delivery Note
Sokha Chan,012345678,St 310 BKK1 Khan Boeng Keng Kang Phnom Penh,25,Leave with condo security
Dara Vong,098112233,St 63 Sangkat Chaktomuk Khan Daun Penh Phnom Penh,18.50,Red gate house #12
Bopha Pich,077445566,St 271 Sangkat Toul Tompoung Phnom Penh,0,Call upon arrival
Kosal Meng,089998877,Russian Federation Blvd Sen Sok Phnom Penh,32,Office reception 2nd floor`;

function parseCodToken(rawToken?: string): number | undefined {
  if (!rawToken) return undefined;
  const cleaned = rawToken.replace(/[$,\s]/g, '');
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return undefined;
  const num = parseFloat(cleaned);
  return Number.isFinite(num) && num >= 0 ? Math.round(num * 100) / 100 : undefined;
}

/**
 * Parses raw CSV or spreadsheet lines into structured bulk stops (supporting optional COD Amount column)
 */
export function parseBulkDropoffText(text: string): ParsedBulkStop[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const firstLineLower = lines[0].toLowerCase();
  const hasHeader =
    firstLineLower.includes('phone') ||
    firstLineLower.includes('address') ||
    firstLineLower.includes('recipient');
  const headerHasCod = hasHeader && firstLineLower.includes('cod');
  const startIndex = hasHeader ? 1 : 0;

  const results: ParsedBulkStop[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.includes('\t') ? line.split('\t') : line.split(',');

    const recipientName = (parts[0] || '').trim();
    const rawPhone = (parts[1] || '').trim();
    const address = (parts[2] || '').trim();
    const fourthCol = (parts[3] || '').trim();
    const parsedCod = parseCodToken(fourthCol);
    const treatFourthAsCod = headerHasCod || parsedCod !== undefined;

    const codAmount = treatFourthAsCod ? parsedCod : undefined;
    const note = (treatFourthAsCod ? parts.slice(4) : parts.slice(3))
      .join(',')
      .trim();

    if (!rawPhone && !address && !recipientName) continue;

    const normalizedPhone = rawPhone ? normalizePhoneNumber(rawPhone) : '';
    const isPhoneValid = isValidCambodiaPhoneNumber(rawPhone);
    const isAddressValid = address.length >= 3;

    let error: string | undefined;
    if (!isPhoneValid) {
      error = 'Invalid phone number';
    } else if (!isAddressValid) {
      error = 'Address required (min 3 chars)';
    }

    results.push({
      id: `bulk-stop-${Date.now()}-${i}`,
      recipientName,
      phoneNumber: isPhoneValid ? normalizedPhone : rawPhone,
      address,
      codAmount,
      note,
      isValid: isPhoneValid && isAddressValid,
      error,
    });
  }

  return results;
}

/**
 * Converts valid parsed stops into the application's canonical DropoffStop model
 */
export function convertParsedToDropoffStops(parsed: ParsedBulkStop[]): DropoffStop[] {
  return parsed
    .filter((p) => p.isValid)
    .slice(0, MAX_DROPOFF_STOPS)
    .map((p, idx) => ({
      id: `stop-${Date.now()}-${idx + 1}`,
      recipient: {
        name: p.recipientName,
        phoneNumber: p.phoneNumber,
        notes: p.note,
      },
      dropoff: {
        address: p.address,
        coordinates: {
          lat: 11.5564 + idx * 0.005,
          lng: 104.9282 + idx * 0.005,
        },
      },
      ...(typeof p.codAmount === 'number' ? { codAmount: p.codAmount } : {}),
    }));
}

/**
 * Generates and downloads a CSV sample template file for the seller
 */
export function downloadSampleCsvTemplate(): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([SAMPLE_BULK_CSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'wingexpress-bulk-dropoff-template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

