import { AuthProvider } from '../services/authContext';
import { ThemeProvider } from '../theme/ThemeContext';
import { LanguageProvider } from '../services/LanguageContext';
import AppNavigator from './navigation/AppNavigator';

const AppContent = () => {
  return <AppNavigator />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>

  );
}
