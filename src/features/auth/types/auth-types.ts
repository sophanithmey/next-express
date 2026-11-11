export interface UserProfile {
  id: string;
  phoneNumber: string;
  name: string;
  shopName?: string;
  email?: string;
  crUrId?: string;
  avatarUrl?: string;
  role?: string;
}

export interface RequestPinPayload {
  phoneNumber: string;
  clientId?: string;
}

export interface RequestPinResponse {
  success: boolean;
  message?: string;
  authType?: string;
  expireInSeconds?: number;
  otpRef?: string;
}

export interface VerifyPinPayload {
  phoneNumber: string;
  pin: string;
  clientId?: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  user?: UserProfile;
}

export interface SessionData {
  user: UserProfile;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

