import React from 'react';
import { View } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useVaultStore } from '@/stores/vault';

export default function VaultItemDetail() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id?.[0] : params.id;
  const router = useRouter();
  const { getById, deleteItem } = useVaultStore();
  const item = id ? getById(id) : undefined;

  const onCopy = async () => {
    if (item?.password) await Clipboard.setStringAsync(item.password);
  };

  const onDelete = async () => {
    if (!id) return;
    await deleteItem(id);
    router.back();
  };

  if (!item) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Item not found</Text>
      </View>
    );
  }

  const password = item.password || '••••••••';

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Card style={{ padding: 16 }}>
        <Text variant="headlineMedium" style={{ marginBottom: 8 }}>
          {String(item.siteName ?? '')}
        </Text>

        <Text>Username: {item.username}</Text>
        <Text>Password: {password}</Text>
        {item.notes ? <Text>Notes: {item.notes}</Text> : null}

        <View style={{ height: 12 }} />

        <Button onPress={onCopy}>Copy Password</Button>

        <Button
          mode="outlined"
          onPress={() => router.push(`/vault/${id}/edit`)}
          style={{ marginTop: 6 }}
        >
          Edit
        </Button>

        <Button
          mode="contained"
          buttonColor="#d32f2f"
          textColor="#fff"
          onPress={onDelete}
          style={{ marginTop: 6 }}
        >
          Delete
        </Button>
      </Card>
    </View>
  );
}
