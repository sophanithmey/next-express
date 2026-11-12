export interface UserProfile {
  id: string;
  phoneNumber: string;
  name: string;
  firstName?: string;
  lastName?: string;
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

export interface AuthContextValue {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  login: (user: UserProfile) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: (callback?: (user: UserProfile) => void) => void;
  closeAuthModal: () => void;
}
