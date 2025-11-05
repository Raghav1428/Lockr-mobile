import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Text, Card, Divider, List, useTheme, Portal, Dialog } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

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
      try { await loadMe(); } finally { setLoadingProfile(false); }
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
      // Refresh profile to update count & last rotation
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
    // Clear plaintext from memory when modal closes
    setCodes([]);
    setShowCodes(false);
    setCopied(false);
  };

  const onLogout = async () => {
    await logout();
  };

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <Text variant="headlineMedium" style={{ marginBottom: 8 }}>Profile</Text>
          <Divider style={{ marginVertical: 8 }} />
          <List.Item title="Email" description={user?.email || '-'} left={props => <List.Icon {...props} icon="email" />} />
          <List.Item title="Role" description={user?.role || 'user'} left={props => <List.Icon {...props} icon="account" />} />
          <List.Item
            title="MFA"
            description={user?.mfaEnabled ? 'Enabled' : 'Disabled'}
            left={props => <List.Icon {...props} icon={user?.mfaEnabled ? 'shield-check' : 'shield-off'} />}
          />
          <List.Item
            title="Backup Codes Remaining"
            description={String(user?.backupCodesRemaining ?? 0)}
            left={props => <List.Icon {...props} icon="numeric" />}
          />
          <List.Item
            title="Last Backup Rotation"
            description={user?.lastBackupRotation ? new Date(user.lastBackupRotation).toLocaleString() : '—'}
            left={props => <List.Icon {...props} icon="history" />}
          />
        </Card>

        <Card style={{ padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <Text variant="titleLarge" style={{ marginBottom: 8 }}>Security</Text>
          <Divider style={{ marginVertical: 8 }} />
          <Button
            mode="contained"
            onPress={onRotate}
            loading={rotating}
            disabled={rotating}
            style={{ borderRadius: 8, marginBottom: 8 }}
            icon="refresh"
          >
            Generate New Backup Codes
          </Button>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            Generating new codes will invalidate any previous codes. You’ll see them once — copy and store safely.
          </Text>
        </Card>

        <Button mode="outlined" onPress={onLogout} style={{ borderRadius: 8 }} icon="logout">
          Logout
        </Button>
      </ScrollView>

      {/* Modal: show codes once */}
      <Portal>
        <Dialog visible={showCodes} onDismiss={onCloseCodes} style={{ borderRadius: 12 }}>
          <Dialog.Title>Save These Backup Codes</Dialog.Title>
          <Dialog.Content>
            {codes.length === 0 ? (
              <Text>No codes to display.</Text>
            ) : (
              <View style={{ paddingVertical: 8 }}>
                {codes.map((c) => (
                  <Text key={c} style={{ fontFamily: 'monospace', letterSpacing: 1, marginBottom: 4 }}>
                    {c}
                  </Text>
                ))}
                <Divider style={{ marginVertical: 12 }} />
                <Text style={{ color: theme.colors.onSurfaceVariant }}>
                  These codes are shown only once. Store them in a safe place.
                </Text>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={onCopy} mode="text" icon={copied ? 'check' : 'content-copy'}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button onPress={onCloseCodes} mode="contained" style={{ marginLeft: 8 }}>
              Done
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}
