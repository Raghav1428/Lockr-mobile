import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVaultStore } from '@/stores/vault';

export default function EditVaultItem() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id?.[0] : params.id;

  const router = useRouter();
  const { getById, updateItem } = useVaultStore();

  const item = id ? getById(id) : undefined;

  const [siteName, setSiteName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Prefill data when screen loads
  useEffect(() => {
    if (item) {
      setSiteName(item.siteName);
      setUsername(item.username);
      setPassword(item.password || '');
      setNotes(item.notes || '');
    }
  }, [item]);

  const onSubmit = async () => {
    if (!id) return;
    setError('');
    setLoading(true);

    try {
      await updateItem(id, { siteName, username, password, notes });
      router.back();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  if (!item) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Item not found</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text variant="headlineMedium">Edit Vault Item</Text>
      {!!error && <Text style={{ color: 'red' }}>{error}</Text>}

      <TextInput label="Site Name" value={siteName} onChangeText={setSiteName} />
      <TextInput label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput label="Notes" value={notes} onChangeText={setNotes} multiline />

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={loading}
        disabled={loading || !siteName || !username || !password}
      >
        Save Changes
      </Button>
    </View>
  );
}
