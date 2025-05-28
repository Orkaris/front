import Loader from "@/src/components/loader";
import { useAuth } from "@/src/context/AuthContext";
import { useThemeContext } from "@/src/context/ThemeContext";
import { i18n } from "@/src/i18n/i18n";
import { Exercise } from "@/src/model/types";
import { apiService } from "@/src/services/api";
import { Link, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { SafeAreaView, Text, StyleSheet, View, Button, Alert } from "react-native";

interface SessionExercise {
    exerciseGoalSessionExercise: {
        exerciseExerciseGoal: {
            id: string;
            name: string;
        };
        reps: number;
        sets: number;
    };
}

interface Session {
    id: string;
    name: string;
    sessionExerciseSession: SessionExercise[];
}

export default function SessionScreen() {
    const [session, setSession] = useState<Session | null>(null);
    const { id: sessionId } = useLocalSearchParams();
    const { theme } = useThemeContext();
    const navigation = useRouter();
    const { userId } = useAuth();

    const fetchSession = useCallback(async () => {
        try {
            console.log('Fetching session:', sessionId);
            const response = await apiService.get<Session>(`/Session/${sessionId}`);
            console.log('Session response:', JSON.stringify(response, null, 2));
            setSession(response);
        } catch (error) {
            console.error('Error fetching session:', error);
            Alert.alert(i18n.t('alert.error'), 'Error fetching session');
        }
    }, [sessionId]);

    useFocusEffect(
        useCallback(() => {
            fetchSession();
        }, [fetchSession])
    );

    if (!session) {
        return <Loader />;
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            {session.sessionExerciseSession.length > 0 ? (
                <View style={styles.container}>
                    {session.sessionExerciseSession.map((exercise) => (
                        <View key={exercise.exerciseGoalSessionExercise.exerciseExerciseGoal.id} 
                              style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
                            <Link style={[styles.exercise, { color: theme.colors.text }]} href={{
                                pathname: '/exercise/[id]',
                                params: { id: exercise.exerciseGoalSessionExercise.exerciseExerciseGoal.id }
                            }}>
                                {exercise.exerciseGoalSessionExercise.exerciseExerciseGoal.name}
                            </Link>
                        </View>
                    ))}

                    <Button
                        title={i18n.t('exercise.new')}
                        onPress={() => navigation.navigate({
                            pathname: "/exercise/new",
                            params: { id: sessionId }
                        })}
                    />
                </View>
            ) : (
                <Text style={{ color: theme.colors.text }}>
                    {i18n.t('exercise.no_exercise')}
                </Text>
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        padding: 20,
        flex: 1,
    },
    input: {
        marginBottom: 20,
        backgroundColor: 'transparent',
    },
    card: {
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        elevation: 3, // For Android shadow
    },
    exercise: {
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 16,
    },
});