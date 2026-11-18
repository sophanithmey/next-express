import {
  DropoffStop,
  GeoCoordinates,
  PickupLocation,
} from '../types/booking-types';
import {
  MAX_BULK_ORDERS,
  MAX_STOPS_PER_BULK_ORDER,
  MAX_TOTAL_COD_USD,
} from '@/lib/constants';
import {
  normalizePhoneNumber,
  isValidCambodiaPhoneNumber,
} from '@/lib/phone-number';
import { parseGoogleMapsLocationInput } from '@/lib/google-maps-link';
import {
  calculateTotalStopCod,
  isValidWingAccountNumber,
  validateDropoffStops,
} from './booking-form-helpers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

/** One grouped order parsed from CSV/Excel (1–5 drop-off stops). */
export interface ParsedBulkOrder {
  /** 1-based order index within the uploaded sheet */
  orderIndex: number;
  /** Original Order # label from the sheet (e.g. "1", "ORD-01") */
  orderKey: string;
  /** Stops kept for this order (max 5) */
  stops: ParsedBulkStop[];
  /** Number of extra stops trimmed when the CSV had > 5 stops for this order */
  truncatedStopCount: number;
  /** Sum of COD amounts across kept stops */
  totalCod: number;
  /** True when this order's COD exceeds MAX_TOTAL_COD_USD ($60) */
  isCodOverLimit: boolean;
  /** True when this order sits beyond MAX_BULK_ORDERS (50) */
  exceedsOrderLimit: boolean;
  /** At least 1 valid stop AND COD within limit */
  isValid: boolean;
  /** Number of valid stops in this order */
  validStopCount: number;
}

/** Editable order inside the Bulk Upload Orders workspace. */
export interface BulkOrderDraft {
  id: string;
  orderRef: string;
  stops: DropoffStop[];
  parcelDescription?: string;
}

export interface BulkBatchValidationResult {
  pickupErrors: Record<string, string>;
  orderErrors: Record<string, Record<string, string>>;
  hasErrors: boolean;
  invalidOrderCount: number;
}

// ---------------------------------------------------------------------------
// Sample data — 3 grouped orders, 6 stops total
// ---------------------------------------------------------------------------

export const SAMPLE_BULK_ROWS = [
  [
    'Order #',
    'Recipient Name',
    'Recipient Phone',
    'Drop-off Address',
    'COD Amount',
    'Delivery Note',
  ],
  [
    1,
    'Sokha Chan',
    '012345678',
    'St 310 BKK1 Khan Boeng Keng Kang Phnom Penh',
    25,
    'Leave with condo security',
  ],
  [
    1,
    'Dara Vong',
    '098112233',
    '11.5564, 104.9282',
    18.5,
    'Red gate house #12 (lat,lng pin)',
  ],
  [
    2,
    'Bopha Pich',
    '077445566',
    'St 271 Sangkat Toul Tompoung Phnom Penh',
    0,
    'Call upon arrival',
  ],
  [
    2,
    'Kosal Meng',
    '089998877',
    '11.5762, 104.9230',
    32,
    'Office reception 2nd floor',
  ],
  [
    2,
    'Chenda Lim',
    '016778899',
    'Russian Market, Sangkat Toul Tompoung, Phnom Penh',
    15,
    'Near south entrance',
  ],
  [3, 'Vanna Ros', '012334455', 'Central Market, Khan Daun Penh, Phnom Penh', 0, ''],
];

export const SAMPLE_BULK_CSV = `Order #,Recipient Name,Recipient Phone,Drop-off Address,COD Amount,Delivery Note
1,Sokha Chan,012345678,St 310 BKK1 Khan Boeng Keng Kang Phnom Penh,25,Leave with condo security
1,Dara Vong,098112233,"11.5564, 104.9282",18.50,Red gate house #12 (lat,lng pin)
2,Bopha Pich,077445566,St 271 Sangkat Toul Tompoung Phnom Penh,0,Call upon arrival
2,Kosal Meng,089998877,"11.5762, 104.9230",32,Office reception 2nd floor
2,Chenda Lim,016778899,Russian Market Sangkat Toul Tompoung Phnom Penh,15,Near south entrance
3,Vanna Ros,012334455,Central Market Khan Daun Penh Phnom Penh,0,`;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

let idSequence = 0;

function createUniqueId(prefix: string): string {
  idSequence += 1;
  return `${prefix}-${Date.now()}-${idSequence}-${Math.random().toString(36).slice(2, 6)}`;
}

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
export function tokenizeBulkRow(row: string): string[] {
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

function parseStopFromParts(
  parts: string[],
  hasOrderCol: boolean,
  headerHasCod: boolean,
): ParsedBulkStop {
  const offset = hasOrderCol ? 1 : 0;

  const recipientName = (parts[offset + 0] || '').trim();
  const rawPhone = (parts[offset + 1] || '').trim();
  let address = (parts[offset + 2] || '').trim();
  let colIndex = offset + 3;

  // Detect unquoted coordinate pair across columns: e.g. "11.5564", "104.9282"
  if (parts.length >= offset + 4) {
    const candidatePair = `${address}, ${parts[offset + 3]}`;
    const candidateDetected = parseGoogleMapsLocationInput(candidatePair);
    if (candidateDetected?.coordinates) {
      address = candidatePair;
      colIndex = offset + 4;
    }
  }

  const fourthCol = (parts[colIndex] || '').trim();
  const parsedCod = parseCodToken(fourthCol);
  const treatFourthAsCod = headerHasCod || parsedCod !== undefined;

  const codAmount = treatFourthAsCod ? parsedCod : undefined;
  const note = (treatFourthAsCod ? parts.slice(colIndex + 1) : parts.slice(colIndex))
    .join(',')
    .trim();

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

  return {
    id: createUniqueId('bulk-stop'),
    recipientName,
    phoneNumber: isPhoneValid ? normalizedPhone : rawPhone,
    address,
    coordinates,
    codAmount,
    note,
    isValid: isPhoneValid && isAddressValid,
    error,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parses raw CSV / spreadsheet text into grouped ParsedBulkOrders.
 *
 * Rows sharing the same `Order #` in column 1 are grouped into one order.
 * Without an `Order #` column, every row becomes its own single-stop order.
 *
 * Returns all discovered orders (flagging `exceedsOrderLimit` beyond 50)
 * and trims each order to MAX_STOPS_PER_BULK_ORDER (5) while recording `truncatedStopCount`.
 */
export function parseBulkOrderText(text: string): ParsedBulkOrder[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const firstLineLower = lines[0].toLowerCase();
  const hasHeader =
    firstLineLower.includes('phone') ||
    firstLineLower.includes('address') ||
    firstLineLower.includes('recipient') ||
    firstLineLower.includes('order');
  const headerHasCod = hasHeader && firstLineLower.includes('cod');
  const startIndex = hasHeader ? 1 : 0;

  let hasOrderCol = false;
  if (hasHeader) {
    hasOrderCol =
      firstLineLower.startsWith('order') ||
      firstLineLower.includes('order #') ||
      firstLineLower.includes('order no') ||
      firstLineLower.includes('order id');
  } else {
    const firstParts = tokenizeBulkRow(lines[0]);
    hasOrderCol = /^\d{1,3}$/.test((firstParts[0] || '').trim());
  }

  const orderMap = new Map<string, ParsedBulkStop[]>();
  const orderKeys: string[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const parts = tokenizeBulkRow(lines[i]);
    const offset = hasOrderCol ? 1 : 0;
    const name = (parts[offset + 0] || '').trim();
    const phone = (parts[offset + 1] || '').trim();
    const addr = (parts[offset + 2] || '').trim();
    if (!name && !phone && !addr) continue;

    const orderKey = hasOrderCol
      ? (parts[0] || '').trim() || `Order-${i}`
      : String(orderKeys.length + 1);

    const stop = parseStopFromParts(parts, hasOrderCol, headerHasCod);

    if (!orderMap.has(orderKey)) {
      orderMap.set(orderKey, []);
      orderKeys.push(orderKey);
    }
    orderMap.get(orderKey)!.push(stop);
  }

  return orderKeys.map((key, idx) => {
    const allStops = orderMap.get(key) || [];
    const stops = allStops.slice(0, MAX_STOPS_PER_BULK_ORDER);
    const truncatedStopCount = Math.max(0, allStops.length - MAX_STOPS_PER_BULK_ORDER);
    const validStopCount = stops.filter((s) => s.isValid).length;
    const totalCod =
      Math.round(
        stops.reduce((sum, s) => sum + (s.isValid ? Math.max(0, s.codAmount ?? 0) : 0), 0) *
          100,
      ) / 100;
    const isCodOverLimit = totalCod > MAX_TOTAL_COD_USD;
    const exceedsOrderLimit = idx >= MAX_BULK_ORDERS;

    return {
      orderIndex: idx + 1,
      orderKey: key,
      stops,
      truncatedStopCount,
      totalCod,
      isCodOverLimit,
      exceedsOrderLimit,
      isValid: validStopCount > 0 && !isCodOverLimit,
      validStopCount,
    };
  });
}

/**
 * Converts a single ParsedBulkOrder's valid stops into canonical DropoffStops.
 */
export function convertOrderToDropoffStops(
  order: ParsedBulkOrder,
  globalOffset = 0,
): DropoffStop[] {
  return order.stops
    .filter((p) => p.isValid)
    .slice(0, MAX_STOPS_PER_BULK_ORDER)
    .map((p, idx) => {
      const globalIdx = globalOffset + idx;
      return {
        id: createUniqueId('stop'),
        recipient: {
          name: p.recipientName,
          phoneNumber: p.phoneNumber,
          notes: p.note,
        },
        dropoff: {
          address: p.address,
          coordinates: p.coordinates || {
            lat: 11.5564 + (globalIdx % 25) * 0.003,
            lng: 104.9282 + (globalIdx % 25) * 0.003,
          },
        },
        codAmount: typeof p.codAmount === 'number' ? p.codAmount : 0,
      };
    });
}

/**
 * Converts parsed orders into editable BulkOrderDraft items (capped at MAX_BULK_ORDERS = 50).
 * Keeps stops even when COD is over limit so the user can edit them in the workspace.
 */
export function convertOrdersToBulkDrafts(
  parsedOrders: ParsedBulkOrder[],
): BulkOrderDraft[] {
  let globalOffset = 0;

  return parsedOrders
    .filter((o) => o.validStopCount > 0)
    .slice(0, MAX_BULK_ORDERS)
    .map((order, idx) => {
      const stops = convertOrderToDropoffStops(order, globalOffset);
      globalOffset += stops.length;
      const cleanRef = /^\d+$/.test(order.orderKey)
        ? `ORD-${String(idx + 1).padStart(2, '0')}`
        : order.orderKey;
      return {
        id: createUniqueId('bulk-order'),
        orderRef: cleanRef,
        stops,
      };
    });
}

/**
 * Creates a blank single-stop BulkOrderDraft for manual addition in the bulk workspace.
 */
export function createEmptyBulkOrderDraft(orderNumber: number): BulkOrderDraft {
  return {
    id: createUniqueId('bulk-order'),
    orderRef: `ORD-${String(orderNumber).padStart(2, '0')}`,
    stops: [
      {
        id: createUniqueId('stop'),
        recipient: { name: '', phoneNumber: '', notes: '' },
        dropoff: {
          address: '',
          coordinates: { lat: 11.5564, lng: 104.9282 },
        },
        codAmount: 0,
      },
    ],
  };
}

/**
 * Creates a blank stop for appending to an existing BulkOrderDraft.
 */
export function createEmptyBulkStop(stopIndex: number): DropoffStop {
  return {
    id: createUniqueId('stop'),
    recipient: { name: '', phoneNumber: '', notes: '' },
    dropoff: {
      address: '',
      coordinates: {
        lat: 11.5512 + stopIndex * 0.004,
        lng: 104.9256 + stopIndex * 0.004,
      },
    },
    codAmount: 0,
  };
}

/**
 * Validates shared pickup fields and every order in a bulk batch.
 */
export function validateBulkOrderBatch(
  pickup: PickupLocation,
  orders: BulkOrderDraft[],
): BulkBatchValidationResult {
  const pickupErrors: Record<string, string> = {};
  const orderErrors: Record<string, Record<string, string>> = {};

  if (!pickup.address?.trim()) {
    pickupErrors['pickup.address'] = 'Pickup address is required.';
  }
  if (!pickup.senderPhone?.trim()) {
    pickupErrors['pickup.senderPhone'] = 'Pickup contact phone number is required.';
  } else if (!isValidCambodiaPhoneNumber(pickup.senderPhone)) {
    pickupErrors['pickup.senderPhone'] =
      'Please enter a valid Cambodian phone number (e.g. 012 888 999).';
  }

  const anyOrderHasCod = orders.some(
    (order) => calculateTotalStopCod(order.stops) > 0,
  );
  const accountName = pickup.settlementAccountName?.trim() || '';
  const accountNumberRaw = pickup.settlementAccountNumber?.trim() || '';

  if (anyOrderHasCod) {
    if (accountName.length < 2) {
      pickupErrors['pickup.settlementAccountName'] =
        'Wing Bank account name is required when any order has COD.';
    }
    if (!accountNumberRaw || !isValidWingAccountNumber(accountNumberRaw)) {
      pickupErrors['pickup.settlementAccountNumber'] =
        'Please enter a valid Wing Bank account number for COD.';
    }
  } else if (accountNumberRaw && !isValidWingAccountNumber(accountNumberRaw)) {
    pickupErrors['pickup.settlementAccountNumber'] =
      'Please enter a valid Wing Bank account number (digits only).';
  }

  let invalidOrderCount = 0;
  orders.forEach((order) => {
    const errs = validateDropoffStops(order.stops);
    if (order.stops.length === 0) {
      errs['stops'] = 'At least 1 drop-off stop is required.';
    } else if (order.stops.length > MAX_STOPS_PER_BULK_ORDER) {
      errs['stops'] = `Maximum ${MAX_STOPS_PER_BULK_ORDER} drop-off stops per order.`;
    }
    if (Object.keys(errs).length > 0) {
      orderErrors[order.id] = errs;
      invalidOrderCount += 1;
    }
  });

  return {
    pickupErrors,
    orderErrors,
    hasErrors:
      orders.length === 0 ||
      orders.length > MAX_BULK_ORDERS ||
      Object.keys(pickupErrors).length > 0 ||
      invalidOrderCount > 0,
    invalidOrderCount,
  };
}

// ---------------------------------------------------------------------------
// File download & upload helpers
// ---------------------------------------------------------------------------

export function downloadSampleCsvTemplate(): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([SAMPLE_BULK_CSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'wingexpress-bulk-order-template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function downloadSampleXlsxTemplate(): Promise<void> {
  if (typeof window === 'undefined') return;
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.aoa_to_sheet(SAMPLE_BULK_ROWS);
  ws['!cols'] = [
    { wch: 10 },
    { wch: 18 },
    { wch: 16 },
    { wch: 42 },
    { wch: 14 },
    { wch: 32 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  XLSX.writeFile(wb, 'wingexpress-bulk-order-template.xlsx');
}

const MAX_BULK_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_BULK_EXTENSIONS = ['.xlsx', '.xls', '.csv', '.txt'];

export async function parseBulkOrderFile(file: File): Promise<string> {
  if (file.size > MAX_BULK_UPLOAD_BYTES) {
    throw new Error('File exceeds the 5 MB upload limit.');
  }

  const fileName = file.name.toLowerCase();
  const hasAllowedExt = ALLOWED_BULK_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext),
  );
  const isExcel =
    fileName.endsWith('.xlsx') ||
    fileName.endsWith('.xls') ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel';

  if (!hasAllowedExt && !isExcel) {
    throw new Error('Unsupported file format. Please upload .xlsx, .xls, or .csv.');
  }

  if (isExcel) {
    const XLSX = await import('xlsx');
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, {
      type: 'array',
      cellFormula: false,
      cellHTML: false,
    });
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
