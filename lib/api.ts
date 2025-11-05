import { getMasterPassword } from '@/security/MasterPasswordStore';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';


const baseURL = "http://10.0.2.2:3000";
console.log("Using API URL:", baseURL);

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send/receive HTTP-only refresh cookie
  timeout: 15000,
});

// ----- Access token in memory for the current session only -----
let accessTokenInMem: string | null = null;
export function setAuthToken(token: string | null) {
  accessTokenInMem = token;
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}
export function getAuthToken() { return accessTokenInMem; }

// ----- Request interceptor: add Authorization + X-Master-Password for vault -----
api.interceptors.request.use(async (config) => {
  // Authorization
  const token = accessTokenInMem || (await SecureStore.getItemAsync('lockr_token')); // not used at bootstrap, but fine during session
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }

  // X-Master-Password only for vault routes
  if (config.url?.startsWith('/api/vault')) {
    config.headers = config.headers ?? {};
    if (!(config.headers as any)['X-Master-Password']) {
      const mp = await getMasterPassword(); // biometric/PIN prompt
      if (mp) (config.headers as any)['X-Master-Password'] = mp;
    }
  }
  return config;
});

// ----- Response interceptor: auto refresh once per 401 -----
let refreshing = false;
let pending: Array<() => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error?.response?.status === 401 && !original._retry) {
      if (refreshing) {
        await new Promise<void>((resolve) => pending.push(resolve));
        return api(original);
      }
      try {
        refreshing = true;
        original._retry = true;
        await api.post('/api/auth/token/refresh'); // cookie-based
        pending.forEach((r) => r());
        pending = [];
        return api(original);
      } catch (e) {
        // refresh failed -> force re-auth (MFA on next launch anyway)
        setAuthToken(null);
        throw e;
      } finally {
        refreshing = false;
      }
    }
    throw error;
  }
);
