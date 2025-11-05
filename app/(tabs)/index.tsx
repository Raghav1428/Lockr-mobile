import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { Text, FAB, List, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useVaultStore } from '@/stores/vault';

export default function DashboardScreen() {
  const router = useRouter();
  const { items, loading, error, fetchList } = useVaultStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchList();
    setRefreshing(false);
  };

  if (loading && items.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {!!error && <Text style={{ color: 'red', padding: 12 }}>{error}</Text>}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <List.Item
            title={item.siteName}
            description={`${item.username}  ••••••••`}
            onPress={() => router.push({ pathname: '/vault/[id]', params: { id: item.id } })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#eee' }} />}
      />
      <FAB style={{ position: 'absolute', right: 16, bottom: 16 }} icon="plus" onPress={() => router.push('/vault/add')}/>
    </View>
  );
}
