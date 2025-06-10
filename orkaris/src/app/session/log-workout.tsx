import { useCallback, useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ScrollView, Alert } from 'react-native';
import { useThemeContext } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/context/AuthContext';
import { i18n } from '@/src/i18n/i18n';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { apiService } from '@/src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Checkbox from 'expo-checkbox';

interface SessionExercise {
    exerciseGoalSessionExercise: {
        exerciseExerciseGoal: {
            id: string;
            name: string;
        };
        reps: number;
        sets: number;
        id: string;
    };
}

interface Session {
    id: string;
    name: string;
    sessionExerciseSession: SessionExercise[];
}

interface Set {
    reps: string;
    weight: string;
    completed: boolean;
}

interface ExercisePerformance {
    exerciseId: string;
    exerciseName: string;
    targetSets: number;
    targetReps: number;
    sets: Set[];
}

export default function LogWorkoutScreen() {
    const [session, setSession] = useState<Session | null>(null);
    const [performances, setPerformances] = useState<ExercisePerformance[]>([]);
    const { id: sessionId } = useLocalSearchParams();
    const { theme } = useThemeContext();
    const router = useRouter();
    const { userId } = useAuth();

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await apiService.get<Session>(`/Session/${sessionId}`);
                setSession(response);
                
                // Initialiser les performances pour chaque exercice
                const initialPerformances = response.sessionExerciseSession.map(exercise => ({
                    exerciseGoaldId: exercise.exerciseGoalSessionExercise.exerciseExerciseGoal.id,
                    exerciseId: exercise.exerciseGoalSessionExercise.id,
                    exerciseName: exercise.exerciseGoalSessionExercise.exerciseExerciseGoal.name,
                    targetSets: exercise.exerciseGoalSessionExercise.sets,
                    targetReps: exercise.exerciseGoalSessionExercise.reps,
                    sets: [{
                        reps: '',
                        weight: '',
                        completed: false
                    }]
                }));
                setPerformances(initialPerformances);
            } catch (error) {
                console.error('Error fetching session:', error);
                Alert.alert(i18n.t('alert.error'), i18n.t('error.fetching_session'));
            }
        };

        if (sessionId) {
            fetchSession();
        }
    }, [sessionId]);

    const handleAddSet = (exerciseIndex: number) => {
        const newPerformances = [...performances];
        newPerformances[exerciseIndex].sets.push({
            reps: '',
            weight: '',
            completed: false
        });
        setPerformances(newPerformances);
    };

    const handleFinish = async () => {
        try {
            // Sauvegarder les performances pour chaque exercice
            for (const performance of performances) {
                const completedSets = performance.sets.filter(set => set.completed);
                if (completedSets.length > 0) {
                    await apiService.post('/ExerciseGoalPerformance', {
                        reps: parseInt(completedSets[0].reps),
                        weight: parseFloat(completedSets[0].weight),
                        sets: completedSets.length,
                        exerciseGoalId: performance.exerciseId
                    });
                }
            }

            Alert.alert(i18n.t('alert.success'), i18n.t('session.workout_completed'));
            router.back();
        } catch (error) {
            console.error('Error saving performance:', error);
            Alert.alert(i18n.t('alert.error'), i18n.t('error.saving_performance'));
        }
    };

    const getTotalSets = () => {
        return performances.reduce((total, performance) => {
            const completedSets = performance.sets.filter(set => set.completed);
            return total + completedSets.length;
        }, 0);
    };

    if (!session) {
        return null;
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{session.name}</Text>
                <TouchableOpacity
                    style={[styles.finishButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleFinish}
                >
                    <Text style={styles.finishButtonText}>{i18n.t('session.finish')}</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.summary, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={[styles.summaryText, { color: theme.colors.text }]}>
                    {i18n.t('session.total_sets', { count: getTotalSets() })}
                </Text>
            </View>

            <ScrollView style={styles.container}>
                {performances.map((performance, exerciseIndex) => (
                    <View key={performance.exerciseId} style={[styles.exerciseCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Link href={{
                            pathname: '/exercise/[id]',
                            params: { id: performance.exerciseId }
                        }}>
                            <Text style={[styles.exerciseName, { color: theme.colors.text }]}>
                                {performance.exerciseName}
                            </Text>
                        </Link>
                        <Text style={[styles.targetText, { color: theme.colors.textSecondary }]}>
                            {i18n.t('session.target_sets_reps', {
                                sets: performance.targetSets,
                                reps: performance.targetReps
                            })}
                        </Text>

                        {performance.sets.map((set, setIndex) => (
                            <View key={setIndex} style={styles.setContainer}>
                                <Text style={[styles.setNumber, { color: theme.colors.text }]}>
                                    {i18n.t('session.set_number', { number: setIndex + 1 })}
                                </Text>
                                <View style={styles.inputsContainer}>
                                    <TextInput
                                        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.outline }]}
                                        value={set.reps}
                                        onChangeText={(value) => {
                                            const newPerformances = [...performances];
                                            newPerformances[exerciseIndex].sets[setIndex].reps = value;
                                            setPerformances(newPerformances);
                                        }}
                                        keyboardType="numeric"
                                        placeholder={i18n.t('session.enter_reps')}
                                        placeholderTextColor={theme.colors.textSecondary}
                                    />
                                    <TextInput
                                        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.outline }]}
                                        value={set.weight}
                                        onChangeText={(value) => {
                                            const newPerformances = [...performances];
                                            newPerformances[exerciseIndex].sets[setIndex].weight = value;
                                            setPerformances(newPerformances);
                                        }}
                                        keyboardType="numeric"
                                        placeholder={i18n.t('session.enter_weight')}
                                        placeholderTextColor={theme.colors.textSecondary}
                                    />
                                </View>
                                <Checkbox
                                    value={set.completed}
                                    onValueChange={(value: boolean) => {
                                        const newPerformances = [...performances];
                                        newPerformances[exerciseIndex].sets[setIndex].completed = value;
                                        setPerformances(newPerformances);
                                    }}
                                />
                            </View>
                        ))}

                        <TouchableOpacity
                            style={[styles.addSetButton, { backgroundColor: theme.colors.primary }]}
                            onPress={() => handleAddSet(exerciseIndex)}
                        >
                            <Ionicons name="add" size={20} color="white" />
                            <Text style={styles.addSetButtonText}>{i18n.t('session.add_set')}</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
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
    finishButton: {
        padding: 10,
        borderRadius: 8,
    },
    finishButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    summary: {
        padding: 15,
        margin: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    summaryText: {
        fontSize: 16,
        fontWeight: '500',
    },
    container: {
        flex: 1,
        padding: 20,
    },
    exerciseCard: {
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 5,
        textDecorationLine: 'underline',
    },
    targetText: {
        fontSize: 14,
        marginBottom: 15,
    },
    setContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 4,
    },
    setNumber: {
        width: 60,
        fontSize: 14,
        fontWeight: '500',
    },
    inputsContainer: {
        flex: 1,
        flexDirection: 'row',
        gap: 10,
        marginRight: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 4,
        padding: 8,
        textAlign: 'center',
    },
    addSetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    addSetButtonText: {
        color: 'white',
        fontSize: 14,
        marginLeft: 5,
    },
}); 