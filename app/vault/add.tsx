import { useVaultStore } from '@/stores/vault';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';

export default function AddVaultItem() {
  const router = useRouter();
  const { addItem } = useVaultStore();
  const theme = useTheme();

  const [siteName, setSiteName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await addItem({ siteName, username, password, notes });
      router.back();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: theme.colors.surfaceVariant,
    height: 42,
    borderRadius: 8,
    paddingHorizontal: 10,
  };

  const Label = ({ children }: { children: string }) => (
    <Text style={{ marginBottom: 4, opacity: 0.7, fontSize: 13 }}>{children}</Text>
  );

  return (
    <View style={{ flex: 1, padding: 16, gap: 14 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 4 }}>
        Add Vault Item
      </Text>

      {!!error && <Text style={{ color: 'red' }}>{error}</Text>}

      <View>
        <Label>Site Name</Label>
        <TextInput
          value={siteName}
          onChangeText={setSiteName}
          mode="flat"
          style={inputStyle}
        />
      </View>

      <View>
        <Label>Username / Email</Label>
        <TextInput
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          mode="flat"
          style={inputStyle}
        />
      </View>

      <View>
        <Label>Password</Label>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="flat"
          style={inputStyle}
        />
      </View>

      <View>
        <Label>Notes (Optional)</Label>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          mode="flat"
          style={[inputStyle, { height: 80, paddingTop: 8 }]}
        />
      </View>

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={loading}
        disabled={loading || !siteName || !username || !password}
        style={{ borderRadius: 10, marginTop: 8, paddingVertical: 6 }}
      >
        Save
      </Button>
    </View>
  );
}
