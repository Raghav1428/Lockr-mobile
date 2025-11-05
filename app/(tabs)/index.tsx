import { useVaultStore } from '@/stores/vault';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, TextInput, View } from 'react-native';
import { ActivityIndicator, Avatar, Button, List, Text, useTheme } from 'react-native-paper';

export default function DashboardScreen() {
  const router = useRouter();
  const { items, loading, error, fetchList } = useVaultStore();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const theme = useTheme();

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchList();
    setRefreshing(false);
  };

  const filteredItems = items.filter((i) =>
    i.siteName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && items.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 34, gap: 12 }}>
      {/* Page Title */}
      <Text variant="headlineMedium" style={{ marginBottom: 4 }}>
        Vault
      </Text>

      {/* Error Text */}
      {!!error && <Text style={{ color: 'red' }}>{error}</Text>}

      {/* Search Input */}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search vault..."
        style={{
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 10,
          padding: 10,
          marginBottom: 4,
        }}
      />

      {/* List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const letter = item.siteName?.charAt(0)?.toUpperCase();
          return (
            <List.Item
              title={item.siteName}
              description={item.username}
              left={() => (
                <Avatar.Text
                  label={letter}
                  size={42}
                  style={{ backgroundColor: theme.colors.primaryContainer }}
                  labelStyle={{ color: theme.colors.primary }}
                />
              )}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => router.push({ pathname: '/vault/[id]', params: { id: item.id } })}
              style={{
                backgroundColor: theme.colors.elevation.level1,
                marginBottom: 10,
                borderRadius: 12,
              }}
            />
          );
        }}
      />

      {/* Add Button */}
      <Button
        mode="contained"
        onPress={() => router.push('/vault/add')}
        style={{ borderRadius: 10, paddingVertical: 6 }}
      >
        + Add Item
      </Button>
    </View>
  );
}
