import React, { useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, useTheme, Card } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { View } from 'react-native';

export default function MfaScreen() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<{ userId?: string }>();
  const { verifyMfa, verifyBackupCode } = useAuth();

  const [token, setToken] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [usingBackup, setUsingBackup] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onVerify = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await verifyMfa({ userId: params.userId, token });
      if (result === 'READY') return router.replace('/(auth)/unlock');
      if (result === 'NEED_MP') return router.replace('/(auth)/master-password');
      setError('Invalid code');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'MFA verification failed');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyBackup = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await verifyBackupCode({ userId: params.userId, backupCode });
      if (result === 'READY') return router.replace('/(auth)/unlock');
      if (result === 'NEED_MP') return router.replace('/(auth)/master-password');
      setError('Invalid or used backup code');
    } catch {
      setError('Backup code verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{
      flexGrow: 1, paddingTop: 60, padding: 24, backgroundColor: theme.colors.background
    }}>
      <Card style={{ padding: 24, borderRadius: 16, elevation: 3 }}>
        <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 8 }}>
          Two-Factor Verification
        </Text>

        <Text variant="bodyMedium" style={{
          textAlign: 'center', color: theme.colors.onSurfaceVariant, marginBottom: 16
        }}>
          {usingBackup
            ? 'Enter one of your backup codes'
            : 'Enter the 6-digit code from your authenticator app'}
        </Text>

        {!!error && (
          <Text style={{ color: theme.colors.error, textAlign: 'center', marginBottom: 8 }}>
            {error}
          </Text>
        )}

        {!usingBackup ? (
          <View>
            <TextInput
              label="6-digit code"
              value={token}
              onChangeText={setToken}
              keyboardType="number-pad"
              maxLength={6}
              mode="outlined"
              style={{ marginBottom: 16, textAlign: 'center', fontSize: 20 }}
            />

            <Button mode="contained" onPress={onVerify} loading={loading}
              disabled={loading || token.length < 6} style={{ borderRadius: 8 }}>
              Verify & Continue
            </Button>

            <TouchableOpacity onPress={() => setUsingBackup(true)}>
              <Text style={{ textAlign: 'center', marginTop: 16, color: theme.colors.primary }}>
                Use a backup code instead
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <TextInput
              label="Backup code"
              value={backupCode}
              onChangeText={setBackupCode}
              autoCapitalize="characters"
              mode="outlined"
              style={{ marginBottom: 16, textAlign: 'center', letterSpacing: 1 }}
            />

            <Button mode="contained" onPress={onVerifyBackup} loading={loading}
              disabled={loading || backupCode.trim().length < 8} style={{ borderRadius: 8 }}>
              Verify Backup Code
            </Button>

            <TouchableOpacity onPress={() => setUsingBackup(false)}>
              <Text style={{ textAlign: 'center', marginTop: 16, color: theme.colors.primary }}>
                Use authenticator code instead
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    </ScrollView>
  );
}
