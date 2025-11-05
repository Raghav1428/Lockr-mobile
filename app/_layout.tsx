import { AuthProvider } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme as NavDarkTheme, DefaultTheme as NavDefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const navTheme = colorScheme === 'dark' ? NavDarkTheme : NavDefaultTheme;
  const paperTheme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  return (
    <AuthProvider>
      <PaperProvider theme={paperTheme}>
        <ThemeProvider value={navTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen 
              name="vault/add" 
              options={{ 
                headerShown: true,
                title: 'Add Password',
                headerBackTitle: 'Back'
              }} 
            />
            <Stack.Screen 
              name="vault/[id]" 
              options={{ 
                headerShown: true,
                title: 'Password Details',
                headerBackTitle: 'Back'
              }} 
            />
            <Stack.Screen 
              name="vault/[id]/edit" 
              options={{ 
                headerShown: true,
                title: 'Edit Password',
                headerBackTitle: 'Back'
              }} 
            />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PaperProvider>
    </AuthProvider>
  );
}
