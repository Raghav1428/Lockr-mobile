import { api, getAuthToken, setAuthToken } from '@/lib/api';
import { masterPasswordExists } from '@/security/MasterPasswordStore';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type User = {
  id: string;
  email?: string;
  role?: 'user' | 'admin' | 'auditor';
  mfaEnabled?: boolean;
  backupCodesRemaining?: number;
  lastBackupRotation?: string;
  createdAt?: string;
  lastLoginAt?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<{ mfaRequired?: boolean; userId?: string } | null>;
  register: (
    email: string,
    password: string
  ) => Promise<{ qrCode?: string; otpAuthUrl?: string; secret?: string; userId?: string } | null>;
  verifyMfa: (payload: { userId?: string; token: string }) => Promise<'NEED_MP' | 'READY' | 'FAIL'>;
  logout: () => Promise<void>;
  loadMe: () => Promise<void>;
  verifyBackupCode: (payload: { userId?: string; backupCode: string }) => Promise<'NEED_MP' | 'READY' | 'FAIL'>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  // ---------------- APP LAUNCH FLOW ----------------
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync('lockr_userId');

        if (!isMounted) return;

        if (storedUserId) {
          // Existing user on device → must MFA
          router.replace({ pathname: '/(auth)/mfa', params: { userId: storedUserId } });
        } else {
          // No user → login
          router.replace('/(auth)/login');
        }
      } catch (err) {
        console.error('Auth init failed:', err);
        router.replace('/(auth)/login');
      } finally {
        if (isMounted) setInitializing(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // ---------------- LOGIN ----------------
  const login = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    const data = res.data || {};

    if (data.mfaRequired) {
      return { mfaRequired: true, userId: data.userId };
    }

    return null;
  };

  // ---------------- REGISTER ----------------
  const register = async (email: string, password: string) => {
    const res = await api.post('/api/auth/register', { email, password });
    const data = res.data || {};

    return {
      qrCode: data.qrCode || data.qr || data.qrCodeDataUrl || data?.mfa?.qr,
      otpAuthUrl: data.otpAuthUrl || data.otp_url || data.otpauth_url || data?.mfa?.otpauth,
      secret: data.secret || data?.mfa?.secret,
      userId: data.userId,
    };
  };

  // ---------------- MFA VERIFY ----------------
  const verifyMfa = async ({ userId, token: mfaToken }: { userId?: string; token: string }) => {
    try {
      const res = await api.post('/api/auth/mfa/verify', { userId, token: mfaToken });
      const data = res.data || {};
      if (!data.token) return 'FAIL';

      // Token for this session only (in-memory, not persisted)
      setTokenState(data.token);
      setAuthToken(data.token);
      setUser({ id: userId || '' });

      // Store only userId to trigger MFA next launch
      if (userId) await SecureStore.setItemAsync('lockr_userId', userId);

      // Check if this device already has master password stored
      const hasMP = await masterPasswordExists();
      return hasMP ? 'READY' : 'NEED_MP';
    } catch {
      return 'FAIL';
    }
  };

  // ---------------- LOGIN VIA BACKUP CODES ----------------
  const verifyBackupCode = async ({ userId, backupCode }: { userId?: string; backupCode: string }) => {
    try {
      const res = await api.post('/api/auth/mfa/verify', { userId, backupCode });
      const data = res.data || {};
      if (!data.token) return 'FAIL';
  
      setTokenState(data.token);
      setAuthToken(data.token);
      setUser({ id: userId || '' });
  
      if (userId) await SecureStore.setItemAsync('lockr_userId', userId);
  
      const hasMP = await masterPasswordExists();
      return hasMP ? 'READY' : 'NEED_MP';
    } catch {
      return 'FAIL';
    }
  };
  
  // ---------------- LOAD MY PROFILE ----------------
  const loadMe = async () => {
    try {
      if (!getAuthToken()) return;
      const res = await api.get('/api/auth/me');
      const u = res.data?.user;
      setUser(u || null);
    } catch (err) {
      console.error('Failed to load user', err);
    }
  };

  // ---------------- LOGOUT ----------------
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {}

    // Do not delete master password (UX choice)
    await SecureStore.deleteItemAsync('lockr_token');
    await SecureStore.deleteItemAsync('lockr_userId');

    setTokenState(null);
    setUser(null);
    setAuthToken(null);

    router.replace('/(auth)/login');
  };

  const value = useMemo(
    () => ({
      user,
      token,
      initializing,
      login,
      register,
      verifyMfa,
      logout,
      loadMe,
      verifyBackupCode
    }),
    [user, token, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
