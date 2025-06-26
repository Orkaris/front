import { useCallback, useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useThemeContext } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/context/AuthContext';
import { i18n } from '@/src/i18n/i18n';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiService } from '@/src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExercise } from "@/src/context/ExerciseContext";

interface SessionExercise {
    exerciseGoalSessionExercise: {
        id: string;
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

export default function EditSessionScreen() {
    const [session, setSession] = useState<Session | null>(null);
    const [sessionName, setSessionName] = useState('');
    const { id: sessionId } = useLocalSearchParams();
    const { theme } = useThemeContext();
    const router = useRouter();
    const { userId } = useAuth();
    const { sessionExercises, addExercise, removeExercise, clearExercises, updateExercise } = useExercise();

    useEffect(() => {
        let isMounted = true;

        const fetchSession = async () => {
            try {
                const response = await apiService.get<Session>(`/Session/${sessionId}`);

                if (isMounted) {
                    setSession(response);
                    setSessionName(response.name);

                    // Initialiser les exercices dans le contexte
                    clearExercises();
                    response.sessionExerciseSession.forEach(exercise => {
                        addExercise({
                            id: exercise.exerciseGoalSessionExercise.exerciseExerciseGoal.id,
                            name: exercise.exerciseGoalSessionExercise.exerciseExerciseGoal.name,
                            reps: exercise.exerciseGoalSessionExercise.reps.toString(),
                            sets: exercise.exerciseGoalSessionExercise.sets.toString(),
                            weight: exercise.exerciseGoalSessionExercise.weight.toString()
                        });
                    });
                }
            } catch (error) {
                console.error('Error fetching session:', error);
                if (isMounted) {
                    Alert.alert(i18n.t('alert.error'), i18n.t('error.fetching_session'));
                }
            }
        };

        if (sessionId) {
            fetchSession();
        }

        return () => {
            isMounted = false;
        };
    }, [sessionId]);

    const handleSave = async () => {
        if (!sessionName.trim()) {
            Alert.alert(i18n.t('alert.error'), i18n.t('session.name_required'));
            return;
        }

        try {
            // Format exercises data according to the API requirements
            const sessionExerciseSession = sessionExercises.map(exercise => {
                // Find the corresponding exercise goal ID from the session data
                const sessionExercise = session?.sessionExerciseSession.find(
                    se => se.exerciseGoalSessionExercise.exerciseExerciseGoal.id === exercise.exerciseId
                );

                return {
                    id: sessionExercise?.exerciseGoalSessionExercise.id || undefined,
                    reps: parseInt(exercise.reps) || 0,
                    sets: parseInt(exercise.sets) || 0,
                    weight: parseInt(exercise.weight) || 0,
                    exerciseId: exercise.exerciseId
                };
            });

            // Update the session with the new format
            await apiService.put(`/Session/${sessionId}`, {
                name: sessionName.trim(),
                userId: userId,
                workoutId: sessionId,
                sessionExerciseSession: sessionExerciseSession
            });

            Alert.alert(i18n.t('alert.success'), i18n.t('session.updated'));
            router.back();
        } catch (error) {
            console.error('Error updating session:', error);
            Alert.alert(i18n.t('alert.error'), i18n.t('error.updating_session'));
        }
    };

    const handleRemoveExercise = async (index: number) => {
        try {
            const exercise = sessionExercises[index];

            const sessionExercise = session?.sessionExerciseSession.find(
                se => se.exerciseGoalSessionExercise.exerciseExerciseGoal.id === exercise.exerciseId
            );

            if (sessionExercise) {
                await apiService.delete(`/Session/${sessionId}/exercise-goal/${sessionExercise.exerciseGoalSessionExercise.id}`);
            }

            removeExercise(index);
        } catch (error) {
            console.error('Error removing exercise:', error);
            Alert.alert(i18n.t('alert.error'), i18n.t('error.removing_exercise'));
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TextInput
                        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.text }]}
                        value={sessionName}
                        onChangeText={setSessionName}
                        placeholder={i18n.t('session.name')}
                        placeholderTextColor={theme.colors.textSecondary}
                    />

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                        keyboardVerticalOffset={120}
                    >
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {sessionExercises.map((exercise, index) => (
                                <View key={exercise.exerciseId} style={[styles.exerciseCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                                    <View style={styles.exerciseHeader}>
                                        <Text style={[styles.exerciseName, { color: theme.colors.text }]}>
                                            {exercise.exerciseName}
                                        </Text>
                                        <TouchableOpacity onPress={() => handleRemoveExercise(index)} >
                                            <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.exerciseInputs}>
                                        <View style={styles.inputGroup}>
                                            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                                                {i18n.t('session.sets')}
                                            </Text>
                                            <TextInput
                                                style={[styles.numberInput, { color: theme.colors.text, borderColor: theme.colors.text }]}
                                                value={exercise.sets}
                                                onChangeText={(value) => updateExercise(index, 'sets', value)}
                                                keyboardType="numeric"
                                                placeholder="0"
                                                placeholderTextColor={theme.colors.textSecondary}
                                            />
                                        </View>
                                        <View style={styles.inputGroup}>
                                            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                                                {i18n.t('session.reps')}
                                            </Text>
                                            <TextInput
                                                style={[styles.numberInput, { color: theme.colors.text, borderColor: theme.colors.text }]}
                                                value={exercise.reps}
                                                onChangeText={(value) => updateExercise(index, 'reps', value)}
                                                keyboardType="numeric"
                                                placeholder="0"
                                                placeholderTextColor={theme.colors.textSecondary}
                                            />
                                        </View>
                                        <View style={styles.inputGroup}>
                                            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                                                {i18n.t('session.weight_label')}
                                            </Text>
                                            <TextInput
                                                style={[styles.numberInput, { color: theme.colors.text, borderColor: theme.colors.text }]}
                                                value={exercise.weight}
                                                onChangeText={(value) => updateExercise(index, 'weight', value)}
                                                keyboardType="numeric"
                                                placeholder="0"
                                                placeholderTextColor={theme.colors.textSecondary}
                                            />
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => router.push({
                            pathname: "/session/select-exercise",
                            params: { id: sessionId }
                        })}
                    >
                        <Ionicons name="add" size={24} color="white" />
                        <Text style={styles.addButtonText}>{i18n.t('exercise.add_exercise')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleSave}
                    >
                        <Text style={styles.saveButtonText}>{i18n.t('session.save')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    removeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 8,
    },
    saveButton: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    header: {
        flex: 1,
        padding: 20,
    },
    scrollView: {
        flex: 1,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
    },
    exercisesContainer: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
    },
    exerciseCard: {
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
    },
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '500',
    },
    exerciseInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputGroup: {
        flex: 1,
        marginRight: 10,
    },
    inputLabel: {
        fontSize: 14,
        marginBottom: 5,
    },
    numberInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
        fontSize: 16,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    addExerciseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
    },
    addExerciseText: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
    createButton: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});