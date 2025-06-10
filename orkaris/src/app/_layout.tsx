import { ThemeProvider } from '@/src/context/ThemeContext';
import { LanguageProvider } from '@/src/context/LanguageContext';
import { AuthProvider } from '@/src/context/AuthContext';
import { ExerciseProvider } from '@/src/context/ExerciseContext';
import AppNavigator from '@/src/app/navigation/AppNavigator';

const AppContent = () => {
    return <AppNavigator />;
}

export default function Layout() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <AuthProvider>
                    <ExerciseProvider>
                        <AppContent />
                    </ExerciseProvider>
                </AuthProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}
