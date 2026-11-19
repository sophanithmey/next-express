/**
 * System Maintenance Configuration & Interceptor Utilities
 * Provides server-side maintenance mode detection, schedule parsing, and administrator bypass.
 */

export interface MaintenanceConfig {
  isActive: boolean;
  estimatedUntil?: string;
  customMessage?: string;
  bypassSecret: string;
}

export function getMaintenanceConfig(): MaintenanceConfig {
  const modeRaw = process.env.MAINTENANCE_MODE?.toLowerCase().trim();
  const isActive = modeRaw === 'true' || modeRaw === '1';

  const estimatedUntil = process.env.MAINTENANCE_UNTIL?.trim();
  const customMessage = process.env.MAINTENANCE_MESSAGE?.trim();
  const bypassSecret = process.env.MAINTENANCE_BYPASS_SECRET || 'express_maint_bypass_secure_2026';

  // If a valid ISO date is provided in MAINTENANCE_UNTIL, check if it has already passed
  if (isActive && estimatedUntil) {
    const untilDate = new Date(estimatedUntil);
    if (!isNaN(untilDate.getTime()) && untilDate.getTime() < Date.now()) {
      return {
        isActive: false,
        estimatedUntil: undefined,
        customMessage: undefined,
        bypassSecret,
      };
    }
  }

  return {
    isActive,
    estimatedUntil: estimatedUntil || undefined,
    customMessage: customMessage || undefined,
    bypassSecret,
  };
}

/**
 * Checks whether system maintenance mode is currently active.
 */
export function isMaintenanceActive(): boolean {
  return getMaintenanceConfig().isActive;
}

/**
 * Validates whether the incoming request contains a valid administrator bypass token.
 */
export function hasAdminBypass(
  cookieBypassValue?: string | null,
  headerBypassValue?: string | null
): boolean {
  const { bypassSecret } = getMaintenanceConfig();
  if (!bypassSecret) return false;

  if (cookieBypassValue && cookieBypassValue === bypassSecret) {
    return true;
  }

  if (headerBypassValue && headerBypassValue === bypassSecret) {
    return true;
  }

  return false;
}

/**
 * Determines whether a given request path is excluded from maintenance mode interception.
 * Allows static assets, favicon, health check endpoints, and the maintenance page itself.
 */
export function isExcludedFromMaintenance(pathname: string): boolean {
  // Never intercept the maintenance page itself (prevents redirect loops)
  if (
    pathname === '/maintenance' ||
    pathname.endsWith('/maintenance') ||
    pathname.includes('/maintenance/')
  ) {
    return true;
  }

  // Static assets & internal framework files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return true;
  }

  // Common file extensions
  if (/\.(png|jpe?g|svg|webp|gif|ico|css|js|woff2?|map)$/i.test(pathname)) {
    return true;
  }

  // Essential API endpoints for monitoring and session validation
  if (
    pathname === '/api/health' ||
    pathname === '/api/auth/session'
  ) {
    return true;
  }

  return false;
}
