import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const KEY = 'lockr_master_password_v1';

export async function saveMasterPassword(password: string) {
  await SecureStore.setItemAsync(KEY, password, {
    keychainService: 'lockr.master',
    requireAuthentication: false,
  });
}

export async function getMasterPassword(): Promise<string | null> {
  const hasHW = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();

  if (hasHW && enrolled) {
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock your vault',
      disableDeviceFallback: false,
      cancelLabel: 'Enter manually',
    });
    if (!res.success) return null;
  }
  return SecureStore.getItemAsync(KEY, {
    keychainService: 'lockr.master',
    requireAuthentication: true,
  });
}

export async function masterPasswordExists(): Promise<boolean> {
  const val = await SecureStore.getItemAsync(KEY, { keychainService: 'lockr.master' });
  return !!val;
}

export async function clearMasterPassword() {
  await SecureStore.deleteItemAsync(KEY, { keychainService: 'lockr.master' });
}


