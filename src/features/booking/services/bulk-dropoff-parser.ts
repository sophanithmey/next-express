import { DropoffStop, GeoCoordinates } from '../types/booking-types';
import { MAX_DROPOFF_STOPS } from '@/lib/constants';
import { normalizePhoneNumber, isValidCambodiaPhoneNumber } from '@/lib/phone-number';
import { parseGoogleMapsLocationInput } from '@/lib/google-maps-link';

export interface ParsedBulkStop {
  id: string;
  recipientName: string;
  phoneNumber: string;
  address: string;
  coordinates?: GeoCoordinates;
  codAmount?: number;
  note: string;
  isValid: boolean;
  error?: string;
}

export const SAMPLE_BULK_ROWS = [
  ['Recipient Name', 'Recipient Phone', 'Drop-off Address', 'COD Amount', 'Delivery Note'],
  ['Sokha Chan', '012345678', 'St 310 BKK1 Khan Boeng Keng Kang Phnom Penh', 25, 'Leave with condo security'],
  ['Dara Vong', '098112233', '11.5564, 104.9282', 18.5, 'Red gate house #12 (lat,lng pin)'],
  ['Bopha Pich', '077445566', 'St 271 Sangkat Toul Tompoung Phnom Penh', 0, 'Call upon arrival'],
  ['Kosal Meng', '089998877', '11.5762, 104.9230', 32, 'Office reception 2nd floor'],
];

export const SAMPLE_BULK_CSV = `Recipient Name,Recipient Phone,Drop-off Address,COD Amount,Delivery Note
Sokha Chan,012345678,St 310 BKK1 Khan Boeng Keng Kang Phnom Penh,25,Leave with condo security
Dara Vong,098112233,"11.5564, 104.9282",18.50,Red gate house #12 (lat,lng pin)
Bopha Pich,077445566,St 271 Sangkat Toul Tompoung Phnom Penh,0,Call upon arrival
Kosal Meng,089998877,"11.5762, 104.9230",32,Office reception 2nd floor`;

function parseCodToken(rawToken?: string): number | undefined {
  if (!rawToken) return undefined;
  const cleaned = rawToken.replace(/[$,\s]/g, '');
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return undefined;
  const num = parseFloat(cleaned);
  return Number.isFinite(num) && num >= 0 ? Math.round(num * 100) / 100 : undefined;
}

/**
 * Splits a row by tab or comma while respecting quoted substrings (e.g. "11.55, 104.92").
 */
export function tokenizeBulkDropoffRow(row: string): string[] {
  if (row.includes('\t')) {
    return row.split('\t').map((c) => c.trim().replace(/^["']|["']$/g, ''));
  }
  if (!row.includes(',') && row.includes(';')) {
    return row.split(';').map((c) => c.trim().replace(/^["']|["']$/g, ''));
  }

  const tokens: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      tokens.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  tokens.push(current.trim());
  return tokens;
}

/**
 * Parses raw CSV or spreadsheet lines into structured bulk stops.
 * Supports street addresses or lat,lng coordinates and optional COD amounts.
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
    const parts = tokenizeBulkDropoffRow(line);

    const recipientName = (parts[0] || '').trim();
    const rawPhone = (parts[1] || '').trim();
    let address = (parts[2] || '').trim();
    let colIndex = 3;

    // Detect unquoted coordinate pair across columns: e.g. parts[2]="11.5564", parts[3]="104.9282"
    if (parts.length >= 4) {
      const candidatePair = `${address}, ${parts[3]}`;
      const candidateDetected = parseGoogleMapsLocationInput(candidatePair);
      if (candidateDetected?.coordinates) {
        address = candidatePair;
        colIndex = 4;
      }
    }

    const fourthCol = (parts[colIndex] || '').trim();
    const parsedCod = parseCodToken(fourthCol);
    const treatFourthAsCod = headerHasCod || parsedCod !== undefined;

    const codAmount = treatFourthAsCod ? parsedCod : undefined;
    const note = (treatFourthAsCod ? parts.slice(colIndex + 1) : parts.slice(colIndex))
      .join(',')
      .trim();

    if (!rawPhone && !address && !recipientName) continue;

    const normalizedPhone = rawPhone ? normalizePhoneNumber(rawPhone) : '';
    const isPhoneValid = isValidCambodiaPhoneNumber(rawPhone);

    const coordsMatch = parseGoogleMapsLocationInput(address);
    const coordinates = coordsMatch?.coordinates;
    const isAddressValid = Boolean(coordinates || address.length >= 3);

    let error: string | undefined;
    if (!isPhoneValid) {
      error = 'Invalid phone number';
    } else if (!isAddressValid) {
      error = 'Address or lat,lng required';
    }

    results.push({
      id: `bulk-stop-${Date.now()}-${i}`,
      recipientName,
      phoneNumber: isPhoneValid ? normalizedPhone : rawPhone,
      address,
      coordinates,
      codAmount,
      note,
      isValid: isPhoneValid && isAddressValid,
      error,
    });
  }

  return results;
}

/**
 * Converts valid parsed stops into the application's canonical DropoffStop model,
 * preserving user-provided lat,lng coordinates whenever present.
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
        coordinates: p.coordinates || {
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

/**
 * Generates and downloads an Excel .xlsx sample template file for the seller.
 * Uses dynamic import so xlsx is only loaded on demand.
 */
export async function downloadSampleXlsxTemplate(): Promise<void> {
  if (typeof window === 'undefined') return;
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.aoa_to_sheet(SAMPLE_BULK_ROWS);
  ws['!cols'] = [
    { wch: 18 },
    { wch: 16 },
    { wch: 40 },
    { wch: 14 },
    { wch: 32 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Drop-offs');
  XLSX.writeFile(wb, 'wingexpress-bulk-dropoff-template.xlsx');
}

/**
 * Reads an uploaded file (.xlsx, .xls, .csv, or .txt) and returns clean spreadsheet text.
 */
export async function parseBulkDropoffFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  const isExcel =
    fileName.endsWith('.xlsx') ||
    fileName.endsWith('.xls') ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel';

  if (isExcel) {
    const XLSX = await import('xlsx');
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = wb.SheetNames[0];
    if (!firstSheetName) return '';
    const ws = wb.Sheets[firstSheetName];
    return XLSX.utils.sheet_to_csv(ws);
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => resolve((ev.target?.result as string) || '');
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
