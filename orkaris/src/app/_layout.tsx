import { AuthProvider, useAuth } from '../services/authContext';
import AppNavigator from './navigation/AppNavigator'; // Votre composant de navigation principal
import { ThemeProvider } from '../theme/ThemeContext';

const AppContent = () => {
  // Ce composant intermédiaire est nécessaire car useAuth doit être appelé
  // à l'intérieur du Provider.
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
