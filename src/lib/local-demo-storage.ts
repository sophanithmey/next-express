export const DEMO_STORAGE_KEYS = {
  orders: 'wingexpress_demo_v1_orders',
  locations: 'wingexpress_demo_v1_locations',
  cards: 'wingexpress_demo_v1_cards',
  userDrafts: 'express_seller_user_saved_drafts',
} as const;

export function isLocalDemoStorageEnabled(): boolean {
  return process.env.NEXT_PUBLIC_LOCAL_DEMO_STORAGE === 'true';
}

export function readStoredDemoArray<T>(
  key: string,
  fallbackSeed: () => T[],
): T[] {
  if (typeof window === 'undefined') return fallbackSeed();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const seeded = fallbackSeed();
      localStorage.setItem(key, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : fallbackSeed();
  } catch {
    return fallbackSeed();
  }
}

export function writeStoredDemoArray<T>(
  key: string,
  items: T[],
  onQuotaFallback?: (items: T[]) => T[],
): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    if (!onQuotaFallback) return;
    try {
      localStorage.setItem(key, JSON.stringify(onQuotaFallback(items)));
    } catch {
      // Ignore unrecoverable storage quota errors
    }
  }
}

export function removeStoredDemoKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
}

