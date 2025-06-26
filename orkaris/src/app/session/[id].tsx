import Loader from "@/src/components/loader";
import { useAuth } from "@/src/context/AuthContext";
import { useThemeContext } from "@/src/context/ThemeContext";
import { i18n } from "@/src/i18n/i18n";
import { Exercise } from "@/src/model/types";
import { apiService } from "@/src/services/api";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState, useEffect } from "react";
import { SafeAreaView, Text, StyleSheet, View, Button, Alert, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useExercise } from '@/src/context/ExerciseContext';

interface SessionExercise {
    exerciseGoalSessionExercise: {
        exerciseExerciseGoal: {
            id: string;
            name: string;
        };
        reps: number;
        sets: number;
        weight: number;
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
    const router = useRouter();
    const { userId } = useAuth();
    const { addExercise } = useExercise();

    const fetchSession = useCallback(async () => {
        try {
            const response = await apiService.get<Session>(`/Session/${sessionId}`);
            setSession(response);
        } catch (error) {
            console.error('Error fetching session:', error);
            Alert.alert(i18n.t('alert.error'), i18n.t('error.fetching_session'));
        }
    }, [sessionId]);

    useEffect(() => {
        if (sessionId) {
            fetchSession();
        }
    }, [sessionId, fetchSession]);

    const handleAddExercise = async () => {
        router.push({
            pathname: "/session/select-exercise",
            params: { id: sessionId }
        });
    };

    if (!session) {
        return <Loader />;
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{session.name}</Text>
                <TouchableOpacity
                    onPress={() => router.push({
                        pathname: "/session/stats",
                        params: { id: sessionId }
                    })}
                    style={styles.editButton}
                >
                    <Ionicons name="stats-chart" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.push({
                        pathname: "/session/edit",
                        params: { id: sessionId }
                    })}
                    style={styles.editButton}
                >
                    <Ionicons name="pencil" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>
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
                            <View style={styles.exerciseDetails}>
                                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                                    {exercise.exerciseGoalSessionExercise.sets} sets × {exercise.exerciseGoalSessionExercise.reps} reps × {exercise.exerciseGoalSessionExercise.weight} kg
                                </Text>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity
                        style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => router.push({
                            pathname: "/session/log-workout",
                            params: { id: sessionId }
                        })}
                    >
                        <Text style={styles.startButtonText}>{i18n.t('session.start_routine')}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                        {i18n.t('session.no_exercises')}
                    </Text>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleAddExercise}
                    >
                        <Ionicons name="add" size={24} color="white" />
                        <Text style={styles.addButtonText}>{i18n.t('exercise.add_exercise')}</Text>
                    </TouchableOpacity>
                </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    editButton: {
        padding: 8,
    },
    card: {
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
    },
    exercise: {
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 16,
    },
    exerciseDetails: {
        marginTop: 8,
        alignItems: 'center',
    },
    detailText: {
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 8,
        marginTop: 20,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 8,
    },
    startButton: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    startButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
});