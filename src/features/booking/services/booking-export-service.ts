import { BookingOrder } from '../types/booking-types';

export type ExportFormat = 'xlsx' | 'csv' | 'pdf';

function formatDateSlug(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pending', draft: 'Pending', confirmed: 'Pending',
    assigned: 'Accepted', out_for_delivery: 'In Transit', delivered: 'Fulfilled', cancelled: 'Cancelled',
  };
  return map[status] || status.toUpperCase();
}

function triggerDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const EXPORT_HEADERS = [
  'Tracking ID', 'Date', 'Status', 'Recipient Name', 'Recipient Phone',
  'Drop-off Address', 'Stops', 'COD Amount ($)', 'Delivery Fee ($)', 'Order Ref / Note',
];

/**
 * Neutralizes spreadsheet formula injection (CSV/XLSX) by prefixing a single quote
 * when a string cell begins with formula trigger characters (=, +, -, @, tab, CR).
 */
export function sanitizeSpreadsheetCell(value: string): string {
  if (/^[=+\-@\t\r]/.test(value)) {
    return `'${value}`;
  }
  return value;
}

function buildOrderRow(order: BookingOrder): (string | number)[] {
  return [
    sanitizeSpreadsheetCell(order.trackingNumber),
    sanitizeSpreadsheetCell(order.createdAt),
    sanitizeSpreadsheetCell(formatStatusLabel(order.status)),
    sanitizeSpreadsheetCell(order.recipient?.name || '-'),
    sanitizeSpreadsheetCell(order.recipient?.phoneNumber || '-'),
    sanitizeSpreadsheetCell(order.dropoff?.address || '-'),
    order.dropoffs?.length || 1,
    order.cod?.isCod ? Number(order.cod.amount.toFixed(2)) : 0,
    Number(order.deliveryFee.toFixed(2)),
    sanitizeSpreadsheetCell(
      order.parcel?.description || order.parcel?.sellerOrderRef || '-',
    ),
  ];
}

/**
 * Exports orders to Microsoft Excel (.xlsx) spreadsheet with auto column sizing.
 */
export async function exportOrdersToXlsx(orders: BookingOrder[], filename?: string): Promise<string> {
  const XLSX = await import('xlsx');
  if (typeof window === 'undefined') {
    const fs = await import('fs');
    XLSX.set_fs(fs);
  }
  const data = [EXPORT_HEADERS, ...orders.map(buildOrderRow)];
  const ws = XLSX.utils.aoa_to_sheet(data);

  ws['!cols'] = [
    { wch: 16 },
    { wch: 22 },
    { wch: 14 },
    { wch: 18 },
    { wch: 16 },
    { wch: 38 },
    { wch: 8 },
    { wch: 14 },
    { wch: 14 },
    { wch: 26 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  const name = filename || `wingexpress-orders-${formatDateSlug()}.xlsx`;
  XLSX.writeFile(wb, name);
  return name;
}

/**
 * Exports orders to UTF-8 CSV with BOM for proper Excel Unicode compatibility.
 */
export function exportOrdersToCsv(orders: BookingOrder[], filename?: string): string {
  const rows = [EXPORT_HEADERS, ...orders.map(buildOrderRow)];
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? '').replace(/"/g, '""');
          return /[",\n\r]/.test(str) ? `"${str}"` : str;
        })
        .join(','),
    )
    .join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const name = filename || `wingexpress-orders-${formatDateSlug()}.csv`;
  triggerDownload(blob, name);
  return name;
}

function escapePdf(text: string): string {
  return text.replace(/[^\x20-\x7E]/g, '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/**
 * Exports orders to a downloadable PDF 1.4 document with branded header and formatted table.
 */
export function exportOrdersToPdf(orders: BookingOrder[], filename?: string): string {
  const rowsPerPage = 28;
  const pagesCount = Math.max(1, Math.ceil(orders.length / rowsPerPage));
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const allObjects: { id: number; text: string }[] = [];
  const pageObjIds: number[] = [];

  let nextId = 5;
  for (let p = 0; p < pagesCount; p++) {
    const pageId = nextId++;
    const contentId = nextId++;
    pageObjIds.push(pageId);

    const slice = orders.slice(p * rowsPerPage, (p + 1) * rowsPerPage);
    const stream: string[] = [
      'BT /F1 14 Tf 40 800 Td (WingExpress Delivery Operations Manifest) Tj ET',
      `BT /F2 9 Tf 40 785 Td (Generated: ${dateStr} | Page ${p + 1} of ${pagesCount} | Total Orders: ${orders.length}) Tj ET`,
      '0.10 0.22 0.52 rg 40 755 515 20 re f',
      '1 1 1 rg',
      'BT /F1 8 Tf 45 762 Td (Tracking ID) Tj 130 762 Td (Date) Tj 200 762 Td (Recipient / Phone) Tj 340 762 Td (Status) Tj 430 762 Td (COD) Tj 485 762 Td (Fee) Tj ET',
      '0 0 0 rg',
    ];

    let y = 740;
    slice.forEach((order, idx) => {
      if (idx % 2 === 1) stream.push(`0.96 0.97 0.98 rg 40 ${y - 4} 515 16 re f`);
      stream.push(`0.85 0.88 0.92 RG 40 ${y - 4} 515 16 re S`, '0.1 0.1 0.1 rg');

      const rec = escapePdf(`${order.recipient?.name || ''} ${order.recipient?.phoneNumber || ''}`.slice(0, 24));
      const trk = escapePdf(order.trackingNumber || '');
      const dt = escapePdf(order.createdAt?.slice(0, 11) || '');
      const st = escapePdf(formatStatusLabel(order.status));
      const cod = `$${(order.cod?.amount || 0).toFixed(2)}`;
      const fee = `$${(order.deliveryFee || 0).toFixed(2)}`;

      stream.push(
        `BT /F2 8 Tf 45 ${y} Td (${trk}) Tj ET`,
        `BT /F2 8 Tf 130 ${y} Td (${dt}) Tj ET`,
        `BT /F2 8 Tf 200 ${y} Td (${rec}) Tj ET`,
        `BT /F2 8 Tf 340 ${y} Td (${st}) Tj ET`,
        `BT /F2 8 Tf 430 ${y} Td (${cod}) Tj ET`,
        `BT /F2 8 Tf 485 ${y} Td (${fee}) Tj ET`,
      );
      y -= 16;
    });

    const body = stream.join('\n');
    allObjects.push(
      { id: pageId, text: `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n` },
      { id: contentId, text: `${contentId} 0 obj\n<< /Length ${body.length} >>\nstream\n${body}\nendstream\nendobj\n` },
    );
  }

  const header = '%PDF-1.4\n';
  const baseObjs = [
    { id: 1, text: '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n' },
    { id: 2, text: `2 0 obj\n<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pagesCount} >>\nendobj\n` },
    { id: 3, text: '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n' },
    { id: 4, text: '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n' },
  ];

  const fullList = [...baseObjs, ...allObjects].sort((a, b) => a.id - b.id);
  const offsets = [0];
  let cur = header.length;
  fullList.forEach((o) => {
    offsets.push(cur);
    cur += o.text.length;
  });

  let xref = `xref\n0 ${fullList.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= fullList.length; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  const trailer = `trailer\n<< /Size ${fullList.length + 1} /Root 1 0 R >>\nstartxref\n${cur}\n%%EOF\n`;
  const pdfString = header + fullList.map((o) => o.text).join('') + xref + trailer;

  const blob = new Blob([pdfString], { type: 'application/pdf' });
  const name = filename || `wingexpress-orders-${formatDateSlug()}.pdf`;
  triggerDownload(blob, name);
  return name;
}
