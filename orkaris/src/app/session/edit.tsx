import { useCallback, useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ScrollView, Alert } from 'react-native';
import { useThemeContext } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/context/AuthContext';
import { i18n } from '@/src/i18n/i18n';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiService } from '@/src/services/api';
import { Exercise } from '@/src/model/types';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExercise } from "@/src/context/ExerciseContext";

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
                            name: exercise.exerciseGoalSessionExercise.exerciseExerciseGoal.name
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
            // Mettre à jour la session
            await apiService.put(`/Session/${sessionId}`, {
                name: sessionName.trim(),
                userId: userId
            });

            // Supprimer tous les exercices existants
            if (session?.sessionExerciseSession) {
                for (const exercise of session.sessionExerciseSession) {
                    await apiService.delete(`/SessionExercise/${sessionId}/${exercise.exerciseGoalSessionExercise.exerciseExerciseGoal.id}`);
                }
            }

            // Ajouter les nouveaux exercices
            for (const exercise of sessionExercises) {
                await apiService.post('/SessionExercise', {
                    sessionId: sessionId,
                    exerciseId: exercise.exerciseId
                });
            }

            Alert.alert(i18n.t('alert.success'), i18n.t('session.updated'));
            router.back();
        } catch (error) {
            console.error('Error updating session:', error);
            Alert.alert(i18n.t('alert.error'), i18n.t('error.updating_session'));
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <View style={styles.container}>
                <TextInput
                    style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.outline }]}
                    value={sessionName}
                    onChangeText={setSessionName}
                    placeholder={i18n.t('session.name')}
                    placeholderTextColor={theme.colors.textSecondary}
                />

                <View style={styles.exercisesContainer}>
                    {sessionExercises.map((exercise, index) => (
                        <View key={exercise.exerciseId} style={[styles.exerciseCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                            <Text style={[styles.exerciseName, { color: theme.colors.text }]}>{exercise.exerciseName}</Text>
                            <View style={styles.exerciseInputs}>
                                <TextInput
                                    style={[styles.numberInput, { color: theme.colors.text, borderColor: theme.colors.outline }]}
                                    value={exercise.reps}
                                    onChangeText={(value) => updateExercise(index, 'reps', value)}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor={theme.colors.textSecondary}
                                />
                                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                                    {i18n.t('session.reps_label')}
                                </Text>
                                <TextInput
                                    style={[styles.numberInput, { color: theme.colors.text, borderColor: theme.colors.outline }]}
                                    value={exercise.sets}
                                    onChangeText={(value) => updateExercise(index, 'sets', value)}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor={theme.colors.textSecondary}
                                />
                                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                                    {i18n.t('session.sets_label')}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => removeExercise(index)}
                                style={styles.removeButton}
                            >
                                <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

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
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        fontSize: 16,
    },
    exercisesContainer: {
        flex: 1,
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
        marginBottom: 10,
    },
    exerciseInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    numberInput: {
        borderWidth: 1,
        borderRadius: 4,
        padding: 8,
        width: 60,
        textAlign: 'center',
    },
    inputLabel: {
        marginHorizontal: 10,
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
}); 