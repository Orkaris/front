import { useCallback, useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ScrollView, Alert } from 'react-native';
import { useThemeContext } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/context/AuthContext';
import { useExercise } from '@/src/context/ExerciseContext';
import { i18n } from '@/src/i18n/i18n';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiService } from '@/src/services/api';
import { Exercise } from '@/src/model/types';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewSessionScreen() {
    const [name, setName] = useState('');
    const { theme } = useThemeContext();
    const { userId } = useAuth();
    const { id: workoutId } = useLocalSearchParams();
    const router = useRouter();
    const { sessionExercises, addExercise, removeExercise, clearExercises, updateExercise } = useExercise();

    const handleRemoveExercise = (index: number) => {
        removeExercise(index);
    };

    const handleCreateSession = async () => {
        if (!name.trim() || sessionExercises.length === 0) {
            Alert.alert(i18n.t('error.name_required'));
            return;
        }

        try {
            await apiService.post('/Session/PostSession2', {
                name: name.trim(),
                workoutId: workoutId,
                userId: userId,
                sessionExerciseSession: sessionExercises.map(ex => ({
                    exerciseId: ex.exerciseId,
                    reps: parseInt(ex.reps),
                    sets: parseInt(ex.sets),
                    weight: parseFloat(ex.weight)
                }))
            });
            Alert.alert(i18n.t('session.session_created'));
            clearExercises();
            router.back();
        } catch (error) {
            console.error('Error creating session:', error);
            Alert.alert(i18n.t('session.session_creation_error'));
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

                    {sessionExercises.map((exercise, index) => (
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
                                        onChangeText={(value) => updateExercise(index, 'reps', value)}
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
                                        onChangeText={(value) => updateExercise(index, 'sets', value)}
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
                                        style={[styles.numberInput, { color: theme.colors.text, borderColor: theme.colors.outline }]}
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
                    onPress={handleCreateSession}
                >
                    <Text style={[styles.createButtonText, { color: theme.colors.textButton }]}>
                        {i18n.t('session.create')}
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