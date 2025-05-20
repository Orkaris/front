import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, SafeAreaView } from 'react-native';
import { apiService } from '@/src/services/api';
import { Program } from '@/src/model/types';
import { useThemeContext } from '@/src/context/ThemeContext';
import Loader from '@/src/components/loader';
import { i18n } from '@/src/i18n/i18n';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useLanguageContext } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';

export default function ProgramsScreen() {
    const [programs, setPrograms] = useState<Program[] | null>(null);
    const { theme } = useThemeContext();
    const { language } = useLanguageContext();
    const navigation = useRouter();
    const { userId, userToken } = useAuth();

    const fetchPrograms = useCallback(async () => {
        try {
            const response = await apiService.get<Program[]>(`/Workout/ByUserId/${userId}`);
            setPrograms(response);
        } catch (error) {
            console.error('Error fetching workouts:', error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchPrograms();
        }, [fetchPrograms])
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            {programs ? (
                <View style={styles.container}>
                    {programs.length > 0 ? (
                        <>
                            {programs.map((program) => (
                                <View key={program.id} style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
                                    <Link style={[styles.program, { color: theme.colors.text }]} href={{
                                        pathname: '/program/[id]',
                                        params: { id: program.id }
                                    }}>
                                        {program.name}
                                    </Link>
                                </View>
                            ))}
                        </>
                    ) : (
                        <Text>{i18n.t('program.no_program')}</Text>
                    )}

                    <Button
                        title={i18n.t('program.new')}
                        onPress={() => navigation.navigate("/program/new")}
                    />
                </View>
            ) : (
                <Loader />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        padding: 20,
        flex: 1,
    },
    card: {
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        elevation: 3, // For Android shadow
    },
    program: {
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 16,
    },
});
