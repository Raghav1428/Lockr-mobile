import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { TextInput, Button, Text, Card, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getMasterPassword } from '@/security/MasterPasswordStore';

export default function UnlockScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [mp, setMp] = useState('');
  const [showMP, setShowMP] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Attempt biometric unlock on mount
  useEffect(() => {
    (async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && enrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Unlock Vault',
            cancelLabel: 'Use Master Password',
          });

          if (result.success) {
            router.replace('/(tabs)');
            return;
          }
        }

        // No biometric or failed → show MP prompt
        setShowMP(true);
      } catch {
        setShowMP(true);
      }
    })();
  }, []);

  const onUnlockWithMP = async () => {
    setError('');
    setLoading(true);
    try {
      const savedMP = await getMasterPassword(); // retrieves stored MP from SecureStore
      if (savedMP && savedMP === mp) {
        router.replace('/(tabs)');
      } else {
        setError('Incorrect Master Password');
      }
    } catch {
      setError('Failed to verify Master Password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
      }}
    >
      <Card style={{ padding: 24, borderRadius: 16, elevation: 3 }}>
        <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 16 }}>
          Unlock Vault
        </Text>

        {!showMP && (
          <Text style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
            Authenticating...
          </Text>
        )}

        {showMP && (
          <View>
            <Text variant="bodyMedium" style={{ textAlign: 'center', marginBottom: 16 }}>
              Enter your Master Password to unlock
            </Text>

            {error ? (
              <Text style={{ color: theme.colors.error, textAlign: 'center', marginBottom: 8 }}>
                {error}
              </Text>
            ) : null}

            <TextInput
              label="Master Password"
              value={mp}
              onChangeText={setMp}
              secureTextEntry
              mode="outlined"
              style={{ marginBottom: 16 }}
            />

            <Button
              mode="contained"
              onPress={onUnlockWithMP}
              loading={loading}
              disabled={loading || mp.length === 0}
              style={{ borderRadius: 8 }}
            >
              Unlock
            </Button>
          </View>
        )}
      </Card>
    </ScrollView>
  );
}
