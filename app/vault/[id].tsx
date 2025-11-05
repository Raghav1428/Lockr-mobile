import { useVaultStore } from '@/stores/vault';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useLayoutEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';

export default function VaultItemDetail() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id?.[0] : params.id;
  const router = useRouter();
  const navigation = useNavigation();
  const theme = useTheme();
  const { getById, deleteItem } = useVaultStore();
  const item = id ? getById(id) : undefined;
  const [showPassword, setShowPassword] = useState(false);

  // Update header title with site name
  useLayoutEffect(() => {
    if (item?.siteName) {
      navigation.setOptions({ title: item.siteName });
    }
  }, [item?.siteName, navigation]);

  const onCopy = async () => {
    if (item?.password) {
      await Clipboard.setStringAsync(item.password);
    }
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

  const password = showPassword ? (item.password || '') : '••••••••';

  const fieldStyle = {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    minHeight: 42,
  };

  const Label = ({ children }: { children: string }) => (
    <Text style={{ marginBottom: 4, opacity: 0.7, fontSize: 13 }}>{children}</Text>
  );

  return (
    <View style={{ flex: 1, padding: 16, gap: 14 }}>

      <View>
        <Label>Site Name</Label>
        <View style={fieldStyle}>
          <Text>{item.siteName}</Text>
        </View>
      </View>

      <View>
        <Label>Username / Email</Label>
        <View style={fieldStyle}>
          <Text>{item.username}</Text>
        </View>
      </View>

      <View>
        <Label>Password</Label>
        <View style={[fieldStyle, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
          <Text style={{ flex: 1 }}>{password}</Text>
          <Button
            mode="text"
            compact
            onPress={() => setShowPassword(!showPassword)}
            style={{ marginLeft: 8 }}
          >
            {showPassword ? 'Hide' : 'Show'}
          </Button>
        </View>
      </View>

      {item.notes && (
        <View>
          <Label>Notes</Label>
          <View style={[fieldStyle, { minHeight: 80, paddingTop: 8 }]}>
            <Text>{item.notes}</Text>
          </View>
        </View>
      )}

      <View style={{ gap: 8, marginTop: 8 }}>
        <Button
          mode="contained"
          onPress={onCopy}
          style={{ borderRadius: 10, paddingVertical: 6 }}
        >
          Copy Password
        </Button>

        <Button
          mode="outlined"
          onPress={() => router.push(`/vault/${id}/edit`)}
          style={{ borderRadius: 10, paddingVertical: 6 }}
        >
          Edit
        </Button>

        <Button
          mode="contained"
          buttonColor={theme.colors.error}
          textColor="#fff"
          onPress={onDelete}
          style={{ borderRadius: 10, paddingVertical: 6 }}
        >
          Delete
        </Button>
      </View>
    </View>
  );
}
