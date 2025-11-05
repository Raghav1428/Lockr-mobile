import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { TextInput, Button, Text, useTheme, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res?.mfaRequired && res.userId) {
        router.push({ pathname: '/(auth)/mfa', params: { userId: res.userId } });
      } else {
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: theme.colors.background,
      }}
    >
      <Card style={{ padding: 24, borderRadius: 16, elevation: 3 }}>
        <Text variant="headlineMedium" style={{ textAlign: 'center', marginBottom: 16 }}>
          Welcome Back 👋
        </Text>

        {!!error && (
          <Text style={{ color: theme.colors.error, textAlign: 'center', marginBottom: 8 }}>
            {error}
          </Text>
        )}

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          mode="outlined"
          style={{ marginBottom: 12 }}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          style={{ marginBottom: 16 }}
        />

        <Button
          mode="contained"
          onPress={onSubmit}
          loading={loading}
          disabled={loading}
          style={{ borderRadius: 8, marginBottom: 8 }}
        >
          Login
        </Button>

        <Button
          onPress={() => router.push('/(auth)/register')}
          mode="text"
          textColor={theme.colors.primary}
        >
          Create an account
        </Button>
      </Card>
    </ScrollView>
  );
}
