import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import {
  isMaintenanceActive,
  hasAdminBypass,
  isExcludedFromMaintenance,
} from '@/server/lib/maintenance';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminBypass = hasAdminBypass(
    request.cookies.get('express_admin_bypass')?.value,
    request.headers.get('x-maintenance-bypass')
  );

  const maintenanceActive = isMaintenanceActive();

  // When maintenance is active and request is neither bypassed nor excluded
  if (maintenanceActive && !adminBypass && !isExcludedFromMaintenance(pathname)) {
    const isKhmer = pathname.startsWith('/km');
    const targetMaintenancePath = isKhmer ? '/km/maintenance' : '/maintenance';

    if (pathname !== targetMaintenancePath) {
      const url = request.nextUrl.clone();
      url.pathname = targetMaintenancePath;
      return NextResponse.redirect(url, { status: 307 });
    }
  }

  // When maintenance is NOT active, redirect any manual visits to /maintenance back to home
  if (!maintenanceActive && (pathname === '/maintenance' || pathname === '/km/maintenance')) {
    const isKhmer = pathname.startsWith('/km');
    const url = request.nextUrl.clone();
    url.pathname = isKhmer ? '/km' : '/';
    return NextResponse.redirect(url, { status: 307 });
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
