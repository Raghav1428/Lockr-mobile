import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Chip,
  Dialog,
  Divider,
  List,
  Portal,
  Text,
  useTheme,
} from 'react-native-paper';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, loadMe, logout } = useAuth();

  const [rotating, setRotating] = useState(false);
  const [showCodes, setShowCodes] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    (async () => {
      setLoadingProfile(true);
      try {
        await loadMe();
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, []);

  const onRotate = async () => {
    setRotating(true);
    setCopied(false);
    try {
      const res = await api.post('/api/auth/mfa/backup/rotate');
      const list: string[] = res.data?.codes || [];
      setCodes(list);
      setShowCodes(true);
      await loadMe();
    } catch (e: any) {
      console.log('Rotate backup codes failed:', e?.response?.data || e?.message);
    } finally {
      setRotating(false);
    }
  };

  const onCopy = async () => {
    try {
      await Clipboard.setStringAsync(codes.join('\n'));
      setCopied(true);
    } catch {}
  };

  const onCloseCodes = () => {
    setCodes([]);
    setShowCodes(false);
    setCopied(false);
  };

  const onLogout = async () => {
    await logout();
  };

  const Pill = ({
    label,
    positive = false,
  }: {
    label: string;
    positive?: boolean;
  }) => {
    const bg = positive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)';
    const fg = positive ? '#10B981' : '#EF4444';
    return (
      <Chip
        compact
        selectedColor={fg}
        style={{
          backgroundColor: bg,
          borderRadius: 6,
          paddingHorizontal: 6, // instead of fixed height
        }}
        textStyle={{ fontSize: 11, fontWeight: '600', marginVertical: 2 }}
      >
        {label}
      </Chip>
    );
  };

  const InfoRow = ({
    label,
    value,
    icon,
    rightComponent,
  }: {
    label: string;
    value?: string | React.ReactNode;
    icon: string;
    rightComponent?: React.ReactNode;
  }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
      }}
    >
      <List.Icon icon={icon} color={theme.colors.onSurfaceVariant} />
      <View style={{ flex: 1, marginLeft: 4 }}>
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant, marginBottom: 2 }}
        >
          {label}
        </Text>
        {typeof value === 'string' ? (
          <Text variant="bodyLarge" style={{ fontWeight: '500' }}>
            {value}
          </Text>
        ) : (
          value
        )}
      </View>
      {rightComponent && <View style={{ marginLeft: 8 }}>{rightComponent}</View>}
    </View>
  );

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingTop: 24 }}>
        {/* Page Title */}
        <Text variant="headlineMedium" style={{ marginBottom: 8 }}>
          Profile
        </Text>

        {/* PROFILE CARD */}
        <Card style={{ borderRadius: 16, overflow: 'hidden' }}>
          {/* Header */}
          <View
            style={{
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.colors.primaryContainer,
            }}
          >
            <Avatar.Icon
              size={56}
              icon="account"
              color={theme.colors.onPrimaryContainer}
              style={{ backgroundColor: theme.colors.primary }}
            />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text variant="headlineSmall" style={{ fontWeight: '600' }}>
                {user?.email || 'User'}
              </Text>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
              >
                Account settings
              </Text>
            </View>
          </View>

          {/* Content */}
          <View style={{ padding: 20 }}>
            {loadingProfile ? (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <ActivityIndicator />
                <Text style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
                  Loading profile…
                </Text>
              </View>
            ) : (
              <View>
                <InfoRow
                  label="Multi-Factor Authentication"
                  icon={user?.mfaEnabled ? 'shield-check' : 'shield-off'}
                  rightComponent={
                    <Pill
                      label={user?.mfaEnabled ? 'Active' : 'Disabled'}
                      positive={!!user?.mfaEnabled}
                    />
                  }
                />

                <Divider />

                <InfoRow
                  label="Backup Codes Remaining"
                  value={String(user?.backupCodesRemaining ?? 0)}
                  icon="key-variant"
                />

                <Divider />

                <InfoRow
                  label="Last Backup Rotation"
                  value={
                    user?.lastBackupRotation
                      ? new Date(user.lastBackupRotation).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'
                  }
                  icon="history"
                />
              </View>
            )}
          </View>
        </Card>

        {/* SECURITY ACTIONS */}
        <Card style={{ borderRadius: 16, overflow: 'hidden' }}>
          <List.Item
            title="Generate New Backup Codes"
            description="Rotates your backup codes and invalidates previous ones"
            left={(props) => (
              <List.Icon {...props} icon="refresh" color={theme.colors.primary} />
            )}
            right={(props) => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {rotating ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <List.Icon {...props} icon="chevron-right" />
                )}
              </View>
            )}
            onPress={onRotate}
            disabled={rotating}
            style={{ paddingVertical: 8 }}
          />
        </Card>

        {/* SIGN OUT */}
        <Button
          mode="outlined"
          onPress={onLogout}
          icon="logout"
          style={{ borderRadius: 12, borderColor: theme.colors.error }}
          textColor={theme.colors.error}
          contentStyle={{ paddingVertical: 4 }}
        >
          Sign out
        </Button>
      </ScrollView>

      {/* Modal: show codes once */}
      <Portal>
        <Dialog visible={showCodes} onDismiss={onCloseCodes} style={{ borderRadius: 16 }}>
          <Dialog.Title>Save These Backup Codes</Dialog.Title>
          <Dialog.Content>
            {codes.length === 0 ? (
              <Text>No codes to display.</Text>
            ) : (
              <View style={{ paddingVertical: 8 }}>
                <View
                  style={{
                    backgroundColor: theme.colors.surfaceVariant,
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                >
                  {codes.map((c, idx) => (
                    <Text
                      key={c}
                      style={{
                        fontFamily: 'monospace',
                        letterSpacing: 1,
                        marginBottom: idx < codes.length - 1 ? 8 : 0,
                        fontSize: 14,
                        fontWeight: '500',
                      }}
                    >
                      {c}
                    </Text>
                  ))}
                </View>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant, lineHeight: 18 }}
                >
                  These codes are shown only once. Store them in a safe place like a password
                  manager.
                </Text>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={onCopy} mode="text" icon={copied ? 'check' : 'content-copy'}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button onPress={onCloseCodes} mode="contained">
              Done
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}
