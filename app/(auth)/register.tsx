import React, { useState } from 'react';
import { View, Image, ScrollView } from 'react-native';
import { TextInput, Button, Text, useTheme, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import * as Linking from 'expo-linking';

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { register, verifyMfa } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [otpAuthUrl, setOtpAuthUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | undefined>();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await register(email.trim(), password);
      if (res?.qrCode) setQrCode(res.qrCode);
      if (res?.userId) setUserId(res.userId);
      if (res?.otpAuthUrl) setOtpAuthUrl(res.otpAuthUrl);
      if (res?.secret) setSecret(res.secret);
    } catch (e: any) {
      console.log("REGISTER ERROR:", {
        url: process.env.EXPO_PUBLIC_API_BASE_URL,
        response: e?.response?.data,
        status: e?.response?.status,
        message: e?.message,
      });
      setError(e?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    setError('');
    setLoading(true);
    try {
      const ok = await verifyMfa({ userId, token });
      if (ok) router.replace('/(auth)/master-password');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'MFA verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: 24,
        backgroundColor: theme.colors.background,
      }}
    >
      <Card style={{ padding: 24, borderRadius: 16, elevation: 3 }}>
        <Text
          variant="headlineMedium"
          style={{
            textAlign: 'center',
            marginBottom: 16,
            color: theme.colors.onSurface,
          }}
        >
          Create Account
        </Text>

        {error ? (
          <Text
            style={{
              color: theme.colors.error,
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            {error}
          </Text>
        ) : null}

        {/* ---------- Registration Form ---------- */}
        {!qrCode && (
          <View>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              mode="outlined"
              style={{ marginBottom: 12 }}
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              mode="outlined"
              style={{ marginBottom: 16 }}
            />
            <Button
              mode="contained"
              onPress={onRegister}
              loading={loading}
              disabled={loading || !email || !password}
              style={{ borderRadius: 8 }}
            >
              Register
            </Button>
          </View>
        )}

        {/* ---------- MFA Setup Step ---------- */}
        {qrCode && (
          <View>
            <Text
              variant="bodyMedium"
              style={{
                textAlign: 'center',
                color: theme.colors.onSurfaceVariant,
                marginBottom: 16,
              }}
            >
              Scan this QR code in your authenticator app, or tap below to add it directly:
            </Text>

            <Image
              source={{ uri: qrCode }}
              style={{
                width: 220,
                height: 220,
                alignSelf: 'center',
                borderRadius: 12,
                marginVertical: 20,
              }}
            />

            <Button
              mode="outlined"
              icon="key"
              onPress={async () => {
                try {
                  if (otpAuthUrl) {
                    await Linking.openURL(otpAuthUrl);
                  } else {
                    throw new Error('No OTP Auth URL found');
                  }
                } catch (err) {
                  console.warn('Failed to open authenticator app:', err);
                  setError(
                    'Could not open authenticator app. Please scan the QR code or manually enter the secret key.'
                  );
                }
              }}
              style={{ marginBottom: 16 }}
            >
              Add to Authenticator App
            </Button>

            {/* ---------- Manual Secret Key ---------- */}
            {secret && (
              <View
                style={{
                  backgroundColor: theme.colors.surfaceVariant,
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    color: theme.colors.onSurface,
                  }}
                >
                  Or manually enter this secret key:
                </Text>
                <Text
                  selectable
                  style={{
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginTop: 4,
                    letterSpacing: 1.2,
                    color: theme.colors.primary,
                  }}
                >
                  {secret}
                </Text>
              </View>
            )}

            {/* ---------- MFA Verification ---------- */}
            <TextInput
              label="6-digit code"
              value={token}
              onChangeText={setToken}
              keyboardType="number-pad"
              maxLength={6}
              mode="outlined"
              style={{ marginBottom: 16 }}
            />

            <Button
              mode="contained"
              onPress={onVerify}
              loading={loading}
              disabled={loading || token.length < 6}
              style={{ borderRadius: 8 }}
            >
              Verify & Continue
            </Button>
          </View>
        )}

        <Button
          onPress={() => router.push('/(auth)/login')}
          mode="text"
          textColor={theme.colors.primary}
          style={{ marginTop: 8 }}
        >
          Back to Login
        </Button>
      </Card>
    </ScrollView>
  );
}
