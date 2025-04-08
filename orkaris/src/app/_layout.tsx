import { AuthProvider, useAuth } from '../services/authContext';
import AppNavigator from './navigation/AppNavigator'; // Votre composant de navigation principal
import { ThemeProvider, useThemeContext } from '../theme/ThemeContext';

const AppContent = () => {
  // Ce composant intermédiaire est nécessaire car useAuth doit être appelé
  // à l'intérieur du Provider.
  return <AppNavigator />;
}

import { Stack } from 'expo-router';
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
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
        <Layout />
      </ThemeProvider>
    </AuthProvider>

  );
}
