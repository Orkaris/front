import { useCallback, useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, FlatList, Alert } from 'react-native';
import { useThemeContext } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/context/AuthContext';
import { useExercise } from '@/src/context/ExerciseContext';
import { i18n } from '@/src/i18n/i18n';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiService } from '@/src/services/api';
import { Exercise } from '@/src/model/types';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SelectExerciseScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isCreatingExercise, setIsCreatingExercise] = useState(false);
    const [newExerciseName, setNewExerciseName] = useState('');
    const { theme } = useThemeContext();
    const { userId } = useAuth();
    const router = useRouter();
    const { workoutId } = useLocalSearchParams();
    const { addExercise } = useExercise();

    const fetchExercises = useCallback(async () => {
        try {
            const response = await apiService.get<Exercise[]>('/Exercise');
            setExercises(response);
        } catch (error) {
            console.error('Error fetching exercises:', error);
            Alert.alert(i18n.t('alert.error'), i18n.t('error.fetching_exercises'));
        }
    }, []);

    useEffect(() => {
        fetchExercises();
    }, [fetchExercises]);

    const handleCreateExercise = async () => {
        if (!newExerciseName.trim()) return;

        try {
            const response = await apiService.post<Exercise>('/Exercise', {
                name: newExerciseName.trim(),
                description: '',
            });
            console.log('Select-exercise.tsx - Created exercise:', response);
            setExercises([...exercises, response]);
            setIsCreatingExercise(false);
            setNewExerciseName('');
            Alert.alert(i18n.t('session.exercise_created'));
            
            // Sélectionner automatiquement l'exercice créé
            addExercise(response);
            router.back();
        } catch (error) {
            console.error('Error creating exercise:', error);
            Alert.alert(i18n.t('alert.error'), i18n.t('error.creating_exercise'));
        }
    };

    const filteredExercises = exercises.filter(exercise =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderExerciseItem = ({ item }: { item: Exercise }) => (
        <TouchableOpacity
            style={[styles.exerciseItem, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => {
                addExercise(item);
                router.back();
            }}
        >
            <Text style={[styles.exerciseName, { color: theme.colors.text }]}>{item.name}</Text>
            <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.colors.text }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder={i18n.t('session.select_exercise')}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                </View>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => setIsCreatingExercise(true)}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {isCreatingExercise ? (
                <View style={[styles.createExerciseCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <TextInput
                        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.outline }]}
                        value={newExerciseName}
                        onChangeText={setNewExerciseName}
                        placeholder={i18n.t('session.exercise_name')}
                        placeholderTextColor={theme.colors.textSecondary}
                    />
                    <View style={styles.createExerciseActions}>
                        <TouchableOpacity 
                            style={[styles.button, { backgroundColor: theme.colors.error }]}
                            onPress={() => setIsCreatingExercise(false)}
                        >
                            <Text style={[styles.buttonText, { color: theme.colors.textButton }]}>
                                {i18n.t('alert.cancel')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.button, { backgroundColor: theme.colors.primary }]}
                            onPress={handleCreateExercise}
                        >
                            <Text style={[styles.buttonText, { color: theme.colors.textButton }]}>
                                {i18n.t('session.create_exercise')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <FlatList
                    data={filteredExercises}
                    renderItem={renderExerciseItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderRadius: 8,
        height: 48,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 16,
    },
    exerciseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '500',
    },
    createExerciseCard: {
        margin: 16,
        padding: 16,
        borderRadius: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    createExerciseActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
    },
}); 