import { Stack } from 'expo-router';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { LanguageProvider } from '@/src/context/LanguageContext';
import { AuthProvider } from '@/src/context/AuthContext';
import { ExerciseProvider } from '@/src/context/ExerciseContext';

export default function Layout() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <AuthProvider>
                    <ExerciseProvider>
                        <Stack />
                    </ExerciseProvider>
                </AuthProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}
