const EN_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const KM_MONTHS = [
  'មករា',
  'កុម្ភៈ',
  'មីនា',
  'មេសា',
  'ឧសភា',
  'មិថុនា',
  'កក្កដា',
  'សីហា',
  'កញ្ញា',
  'តុលា',
  'វិច្ឆិកា',
  'ធ្នូ',
] as const;

/**
 * Formats an ISO timestamp or date string into "dd MMM yyyy HH:mm"
 * Example outputs:
 *  - English: "20 Nov 2026 11:00"
 *  - Khmer:   "20 វិច្ឆិកា 2026 11:00"
 *
 * If the raw string is not a valid date (e.g. "Tonight at 10 PM"),
 * it gracefully returns the original string.
 */
export function formatEstimatedTime(raw?: string, locale: string = 'en'): string {
  if (!raw) return '';

  const d = new Date(raw);
  if (isNaN(d.getTime())) {
    return raw;
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month =
    locale === 'km' ? KM_MONTHS[d.getMonth()] : EN_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year} ${hours}:${minutes}`;
}
