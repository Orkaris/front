import { AuthProvider, useAuth } from '../services/authContext';
import AppNavigator from './navigation/AppNavigator'; // Votre composant de navigation principal
import { ThemeProvider, useThemeContext } from '../theme/ThemeContext';

const AppContent = () => {
  return <AppNavigator />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>

  );
}
