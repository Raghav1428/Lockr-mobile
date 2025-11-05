import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useVaultStore } from '@/stores/vault';

export default function AddVaultItem() {
  const router = useRouter();
  const { addItem } = useVaultStore();
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

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text variant="headlineMedium">Add Vault Item</Text>
      {!!error && <Text style={{ color: 'red' }}>{error}</Text>}
      <TextInput label="Site Name" value={siteName} onChangeText={setSiteName} />
      <TextInput label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput label="Notes" value={notes} onChangeText={setNotes} multiline />
      <Button mode="contained" onPress={onSubmit} loading={loading} disabled={loading || !siteName || !username || !password}>
        Save
      </Button>
    </View>
  );
}
