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

interface SessionExercise {
    exerciseId: string;
    exerciseName: string;
    reps: string;
    sets: string;
}

export default function EditSessionScreen() {
    const [name, setName] = useState('');
    const [exercises, setExercises] = useState<SessionExercise[]>([]);
    const { theme } = useThemeContext();
    const { userId } = useAuth();
    const { id: sessionId, selectedExercise } = useLocalSearchParams();
    const router = useRouter();

    const fetchSession = useCallback(async () => {
        try {
            const response = await apiService.get<{
                id: string;
                name: string;
                userId: string;
                workoutId: string;
                createdAt: string;
                sessionExerciseSession: Array<{
                    exerciseId: string;
                    exerciseName: string;
                    reps: number;
                    sets: number;
                }>;
            }>(`/Session/${sessionId}`);
            console.log('Session response:', JSON.stringify(response, null, 2));
            setName(response.name);
            setExercises(response.sessionExerciseSession.map(ex => ({
                exerciseId: ex.exerciseId,
                exerciseName: ex.exerciseName,
                reps: ex.reps.toString(),
                sets: ex.sets.toString()
            })));
        } catch (error) {
            console.error('Error fetching session:', error);
            Alert.alert(i18n.t('session.session_creation_error'));
            router.back();
        }
    }, [sessionId]);

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    useEffect(() => {
        if (selectedExercise) {
            const exercise = JSON.parse(selectedExercise as string) as Exercise;
            setExercises([...exercises, {
                exerciseId: exercise.id,
                exerciseName: exercise.name,
                reps: '',
                sets: ''
            }]);
        }
    }, [selectedExercise]);

    const handleRemoveExercise = (index: number) => {
        const newExercises = [...exercises];
        newExercises.splice(index, 1);
        setExercises(newExercises);
    };

    const handleUpdateSession = async () => {
        console.log('Current name value:', name);
        console.log('Current name trimmed:', name.trim());
        console.log('Exercises length:', exercises.length);
        
        if (!name.trim()) {
            Alert.alert(i18n.t('error.name_required'));
            return;
        }

        try {
            await apiService.put(`/Session/${sessionId}`, {
                name: name.trim(),
                userId: userId,
                exercises: exercises.map(ex => ({
                    exerciseId: ex.exerciseId,
                    reps: parseInt(ex.reps),
                    sets: parseInt(ex.sets)
                }))
            });
            Alert.alert(i18n.t('session.session_updated'));
            router.back();
        } catch (error) {
            console.error('Error updating session:', error);
            Alert.alert(i18n.t('session.session_update_error'));
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView style={styles.scrollView}>
                <TextInput
                    style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.outline }]}
                    value={name}
                    onChangeText={setName}
                    placeholder={i18n.t('session.name')}
                    placeholderTextColor={theme.colors.textSecondary}
                />

                <View style={styles.exercisesContainer}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                        {i18n.t('session.add_exercise')}
                    </Text>

                    {exercises.map((exercise, index) => (
                        <View key={index} style={[styles.exerciseCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                            <View style={styles.exerciseHeader}>
                                <Text style={[styles.exerciseName, { color: theme.colors.text }]}>
                                    {exercise.exerciseName}
                                </Text>
                                <TouchableOpacity onPress={() => handleRemoveExercise(index)}>
                                    <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.exerciseInputs}>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                                        {i18n.t('session.reps')}
                                    </Text>
                                    <TextInput
                                        style={[styles.numberInput, { color: theme.colors.text, borderColor: theme.colors.outline }]}
                                        value={exercise.reps}
                                        onChangeText={(value) => {
                                            const newExercises = [...exercises];
                                            newExercises[index].reps = value;
                                            setExercises(newExercises);
                                        }}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor={theme.colors.textSecondary}
                                    />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                                        {i18n.t('session.sets')}
                                    </Text>
                                    <TextInput
                                        style={[styles.numberInput, { color: theme.colors.text, borderColor: theme.colors.outline }]}
                                        value={exercise.sets}
                                        onChangeText={(value) => {
                                            const newExercises = [...exercises];
                                            newExercises[index].sets = value;
                                            setExercises(newExercises);
                                        }}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor={theme.colors.textSecondary}
                                    />
                                </View>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity 
                        style={[styles.addExerciseButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => router.push('/session/select-exercise')}
                    >
                        <Ionicons name="add" size={24} color="white" />
                        <Text style={[styles.addExerciseText, { color: theme.colors.textButton }]}>
                            {i18n.t('session.add_exercise')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleUpdateSession}
                >
                    <Text style={[styles.createButtonText, { color: theme.colors.textButton }]}>
                        {i18n.t('session.update')}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        padding: 20,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
    },
    exercisesContainer: {
        marginBottom: 20,
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
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
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