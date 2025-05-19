import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, Button, SafeAreaView } from 'react-native';
import { apiService } from '@/src/services/api';
import { User, Workout } from '@/src/model/types';
import { useThemeContext } from '@/src/context/ThemeContext';
import Loader from '@/src/components/loader';
import { i18n } from '@/src/i18n/i18n';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useLanguageContext } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';

export default function ProgramsScreen() {
    const [workouts, setWorkouts] = useState<Workout[] | null>(null);
    const { theme } = useThemeContext();
    const { language } = useLanguageContext();
    const navigation = useRouter();
    const { userId, userToken } = useAuth();

    const fetchWorkouts = useCallback(async () => {
        try {
            const response = await apiService.get<Workout[]>(`/Workout/ByUserId/${userId}`);
            setWorkouts(response);
        } catch (error) {
            console.error('Error fetching workouts:', error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchWorkouts();
        }, [fetchWorkouts])
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            {workouts ? (
                <View style={styles.container}>
                    {workouts.length > 0 ? (
                        <>
                            {workouts.map((workout) => (
                                <View key={workout.id} style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
                                    <Link style={[styles.workout, { color: theme.colors.text }]} href={{
                                        pathname: '/program/[id]',
                                        params: { id: workout.id }
                                    }}>
                                        {workout.name}
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
    workout: {
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 16,
    },
});
