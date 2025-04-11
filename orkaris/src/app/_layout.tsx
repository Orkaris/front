import { AuthProvider } from '../context/AuthContext';
import AppNavigator from './navigation/AppNavigator'; // Votre composant de navigation principal
import { ThemeProvider } from '../context/ThemeContext';

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
