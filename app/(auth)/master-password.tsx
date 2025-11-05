import { saveMasterPassword } from '@/security/MasterPasswordStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Text, TextInput, useTheme } from 'react-native-paper';

export default function MasterPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [mp, setMp] = useState('');
  const [mp2, setMp2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    setError('');
    if (mp.length < 8) return setError('Use at least 8 characters');
    if (mp !== mp2) return setError('Passwords do not match');
    setLoading(true);
    try {
      await saveMasterPassword(mp);
      router.replace('/(tabs)');
    } catch (e) {
      setError('Failed to save master password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, backgroundColor: theme.colors.background }}>
      <Card style={{ padding: 24, borderRadius: 16, elevation: 3 }}>
        <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 8 }}>
          Set Your Master Password
        </Text>
        <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
          This unlocks your vault on this device. You’ll authenticate with MFA every time you open the app.
        </Text>

        {!!error && <Text style={{ color: theme.colors.error, textAlign: 'center', marginBottom: 8 }}>{error}</Text>}

        <TextInput label="Master Password" value={mp} onChangeText={setMp} secureTextEntry mode="outlined" style={{ marginBottom: 12 }} />
        <TextInput label="Confirm Master Password" value={mp2} onChangeText={setMp2} secureTextEntry mode="outlined" style={{ marginBottom: 16 }} />

        <Button mode="contained" onPress={onSave} loading={loading} disabled={loading} style={{ borderRadius: 8 }}>
          Save & Continue
        </Button>

        <View style={{ marginTop: 16 }}>
          <Text style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
            Stored encrypted in your device’s secure hardware. Access requires FaceID/TouchID or device PIN.
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}
