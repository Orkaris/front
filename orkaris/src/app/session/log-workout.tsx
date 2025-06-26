import { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useThemeContext } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/context/AuthContext';
import { i18n } from '@/src/i18n/i18n';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { apiService } from '@/src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SessionExercise {
    exerciseGoalSessionExercise: {
        exerciseExerciseGoal: {
            id: string;
            name: string;
        };
        reps: number;
        sets: number;
        id: string;
        weight: number;
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
    targetWeight: number;
    sets: Set[];
    lastPerformance: {
        reps: number;
        weight: number;
    } | null;
}

export default function LogWorkoutScreen() {
    const [session, setSession] = useState<Session | null>(null);
    const [performances, setPerformances] = useState<ExercisePerformance[]>([]);
    const [duration, setDuration] = useState<number | null>(null);
    const [durationError, setDurationError] = useState<boolean>(false);
    const { id: sessionId } = useLocalSearchParams();
    const { theme } = useThemeContext();
    const router = useRouter();
    const { userId } = useAuth();

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await apiService.get<Session>(`/Session/${sessionId}`);
                setSession(response);
                console.log(response);

                // Fetch last performances for each exercise
                const performancesWithLastData = await Promise.all(response.sessionExerciseSession.map(async (exercise) => {
                    const lastPerformanceResponse = await apiService.get<any[]>(`/ExerciseGoalPerformance/ByExerciseGoal/${exercise.exerciseGoalSessionExercise.id}`);
                    // Sort by createdAt descending to get the latest performance
                    const sortedPerformances = lastPerformanceResponse.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    const lastPerformance = sortedPerformances.length > 0 ? sortedPerformances[0] : null;

                    return {
                        exerciseGoaldId: exercise.exerciseGoalSessionExercise.exerciseExerciseGoal.id,
                        exerciseId: exercise.exerciseGoalSessionExercise.id,
                        exerciseName: exercise.exerciseGoalSessionExercise.exerciseExerciseGoal.name,
                        targetSets: exercise.exerciseGoalSessionExercise.sets,
                        targetReps: exercise.exerciseGoalSessionExercise.reps,
                        targetWeight: exercise.exerciseGoalSessionExercise.weight,
                        sets: [{
                            reps: '',
                            weight: '',
                            completed: false
                        }],
                        lastPerformance: lastPerformance ? { reps: lastPerformance.reps, weight: lastPerformance.weight } : null
                    };
                }));
                setPerformances(performancesWithLastData);
            } catch (error) {
                console.error('Error fetching session or last performance:', error);
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

    const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
        const newPerformances = [...performances];
        // Don't allow removing the last set
        if (newPerformances[exerciseIndex].sets.length > 1) {
            newPerformances[exerciseIndex].sets.splice(setIndex, 1);
            setPerformances(newPerformances);
        }
    };

    const handleFinish = async () => {
        if (!session) {
            Alert.alert(i18n.t('alert.error'), i18n.t('error.session_not_loaded'));
            return;
        }
        if (!duration) {
            setDurationError(true);
            Alert.alert(i18n.t('alert.error'), i18n.t('error.duration_required'));
            return;
        }
        try {
            // Save performances for each exercise
            for (const performance of performances) {
                const setsWithData = performance.sets.filter(set => set.reps && set.weight);
                if (setsWithData.length > 0) {
                    for (const set of setsWithData) {
                        await apiService.post('/ExerciseGoalPerformance', {
                            reps: parseInt(set.reps),
                            weight: parseFloat(set.weight),
                            sets: 1, // Each logged set is 1 set in the performance
                            exerciseGoalId: performance.exerciseId
                        });
                    }
                }
            }
            await apiService.post('/SessionPerformance', {
                sessionId: session.id,
                feeling: 'good',
                date: new Date().toISOString(),
            });

            Alert.alert(i18n.t('alert.success'), i18n.t('session.workout_completed'));
            router.back();
        } catch (error) {
            console.error('Error saving performance:', error);
            Alert.alert(i18n.t('alert.error'), i18n.t('error.saving_performance'));
        }
    };

    const getTotalSets = () => {
        return performances.reduce((total, performance) => {
            const setsWithData = performance.sets.filter(set => set.reps && set.weight);
            return total + setsWithData.length;
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

            <View style={[styles.summary, { backgroundColor: theme.colors.surfaceVariant, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <Text style={[styles.summaryText, { color: theme.colors.text }]}>
                    {i18n.t('session.total_duration')}
                </Text>
                <TextInput
                    style={[styles.tdWeight, { borderColor: durationError ? theme.colors.error : theme.colors.outline }]}
                    value={duration?.toString() ?? ''}
                    onChangeText={(value) => {
                        setDuration(value ? parseInt(value) : null);
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.colors.textSecondary}
                />
            </View>

            <View style={[styles.summary, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={[styles.summaryText, { color: theme.colors.text }]}>
                    {i18n.t('session.total_sets', { count: getTotalSets(), plural: getTotalSets() > 1 ? 's' : '' })}
                </Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={80}
            >
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

                            <View style={styles.tableHeader}>
                                <Text style={styles.thSet}>{i18n.t('session.set').toUpperCase()}</Text>
                                <Text style={styles.thPrev}>{i18n.t('session.previous').toUpperCase()}</Text>
                                <Text style={styles.thReps}>{i18n.t('session.reps').toUpperCase()}</Text>
                                <Text style={styles.thWeight}><Ionicons name="barbell-outline" size={16} color={theme.colors.textSecondary} /> KG</Text>
                                <Text style={styles.thRemove}></Text>
                            </View>

                            {performance.sets.map((set, setIndex) => (
                                <View key={setIndex} style={styles.setRow}>
                                    <Text style={styles.tdSet}>{setIndex + 1}</Text>
                                    <Text style={styles.tdPrev}>
                                        {performance.lastPerformance ? `${performance.lastPerformance.weight}kg x ${performance.lastPerformance.reps}` : '-'}
                                    </Text>
                                    <TextInput
                                        style={styles.tdReps}
                                        value={set.reps}
                                        onChangeText={(value) => {
                                            const newPerformances = [...performances];
                                            newPerformances[exerciseIndex].sets[setIndex].reps = value;
                                            setPerformances(newPerformances);
                                        }}
                                        keyboardType="numeric"
                                        placeholder={performance.targetReps.toString()}
                                        placeholderTextColor={theme.colors.textSecondary}
                                    />
                                    <TextInput
                                        style={styles.tdWeight}
                                        value={set.weight}
                                        onChangeText={(value) => {
                                            const newPerformances = [...performances];
                                            newPerformances[exerciseIndex].sets[setIndex].weight = value;
                                            setPerformances(newPerformances);
                                        }}
                                        keyboardType="numeric"
                                        placeholder={performance.targetWeight.toString()}
                                        placeholderTextColor={theme.colors.textSecondary}
                                    />
                                    <TouchableOpacity
                                        onPress={() => handleRemoveSet(exerciseIndex, setIndex)}
                                        disabled={performance.sets.length <= 1}
                                        style={[styles.tdRemove, { opacity: performance.sets.length <= 1 ? 0.3 : 1 }]}
                                    >
                                        <Ionicons
                                            name="remove-circle-outline"
                                            size={20}
                                            color={performance.sets.length <= 1 ? theme.colors.textSecondary : theme.colors.error}
                                        />
                                    </TouchableOpacity>
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
            </KeyboardAvoidingView>
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
        paddingHorizontal: 20,
        paddingBottom: 20,
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
    tableHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        paddingBottom: 2,
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        minHeight: 38,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
    },
    thSet: {
        width: 38,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 12,
        color: '#888',
    },
    thPrev: {
        width: 90,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 12,
        color: '#888',
    },
    thWeight: {
        width: 60,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 12,
        color: '#888',
        alignItems: 'center',
        justifyContent: 'center',
    },
    thReps: {
        width: 82,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 12,
        color: '#888',
        alignItems: 'center',
        justifyContent: 'center',
    },
    thRemove: {
        width: 24,
    },
    tdSet: {
        width: 38,
        textAlign: 'center',
        fontSize: 14,
        color: '#222',
    },
    tdPrev: {
        width: 90,
        textAlign: 'center',
        fontSize: 13,
        color: '#666',
    },
    tdWeight: {
        width: 60,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        paddingVertical: 4,
        paddingHorizontal: 0,
        textAlign: 'center',
        fontSize: 14,
        marginHorizontal: 2,
        color: '#222',
        backgroundColor: '#fff',
    },
    tdReps: {
        width: 70,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        paddingVertical: 4,
        paddingHorizontal: 0,
        textAlign: 'center',
        fontSize: 14,
        marginHorizontal: 6,
        color: '#222',
        backgroundColor: '#fff',
    },
    tdRemove: {
        width: 24,
        alignItems: 'center',
        justifyContent: 'center',
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
    removeButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
    },
});