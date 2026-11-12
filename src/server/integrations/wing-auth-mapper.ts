import 'server-only';
import { UserProfile } from '@/features/auth/types/auth-types';

export interface ConsumerUserProfileBody {
  id?: string | null;
  phone_number?: string | null;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

function cleanString(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Maps `/user/v1/consumer/users/profile` `body` payload into the application's `UserProfile`.
 */
export function mapConsumerUserProfile(
  body: ConsumerUserProfileBody,
  options?: { fallbackPhone?: string; fallbackUser?: UserProfile },
): UserProfile {
  const fallbackUser = options?.fallbackUser;
  const firstName = cleanString(body.first_name);
  const lastName = cleanString(body.last_name);
  const phoneNumber =
    cleanString(body.phone_number) ||
    cleanString(fallbackUser?.phoneNumber) ||
    cleanString(options?.fallbackPhone) ||
    '';

  const combinedName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const fallbackName =
    fallbackUser?.name && fallbackUser.name !== '--'
      ? fallbackUser.name.trim()
      : undefined;
  const name =
    combinedName ||
    fallbackName ||
    cleanString(fallbackUser?.shopName) ||
    phoneNumber ||
    'Express Merchant';

  return {
    id:
      cleanString(body.id) ||
      fallbackUser?.id ||
      `user-${phoneNumber.replace(/[^\d]/g, '')}`,
    phoneNumber,
    name,
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
    ...(cleanString(body.email) || fallbackUser?.email
      ? { email: cleanString(body.email) || fallbackUser?.email }
      : {}),
    ...(fallbackUser?.shopName ? { shopName: fallbackUser.shopName } : {}),
    ...(fallbackUser?.crUrId ? { crUrId: fallbackUser.crUrId } : {}),
    role: fallbackUser?.role || 'SELLER',
  };
}

