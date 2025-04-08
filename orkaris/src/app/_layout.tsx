import { Stack } from 'expo-router';
import { ThemeProvider, useThemeContext } from '../theme/ThemeContext';
import { i18n } from '../i18n/i18n';

function Layout() {
  const { theme } = useThemeContext();

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{
        headerTitle: '',
        headerBackTitle: i18n.t('navigation.back'),
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
      }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Layout />
    </ThemeProvider>

  );
}
