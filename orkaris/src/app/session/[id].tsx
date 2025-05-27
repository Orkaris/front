import Loader from "@/src/components/loader";
import { useAuth } from "@/src/context/AuthContext";
import { useThemeContext } from "@/src/context/ThemeContext";
import { i18n } from "@/src/i18n/i18n";
import { Exercise } from "@/src/model/types";
import { apiService } from "@/src/services/api";
import { Link, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { SafeAreaView, Text, StyleSheet, View, Button, Alert } from "react-native";

interface SessionExerciseResponse {
    exerciseId: string;
    exerciseName: string;
    reps: number;
    sets: number;
}

export default function SessionScreen() {
    const [exercises, setExercises] = useState<SessionExerciseResponse[]>([]);
    const { id: sessionId } = useLocalSearchParams();
    const { theme } = useThemeContext();
    const navigation = useRouter();
    const { userId } = useAuth();

    const fetchSessionExercises = useCallback(async () => {
        try {
            const response = await apiService.get<SessionExerciseResponse[]>(`/SessionExercise/BySessionId/${sessionId}`);
            setExercises(response);
        } catch (error) {
            console.error('Error fetching session exercises:', error);
            Alert.alert(i18n.t('alert.error'), 'Error fetching session exercises');
        }
    }, [sessionId]);

    useFocusEffect(
        useCallback(() => {
            fetchSessionExercises();
        }, [fetchSessionExercises])
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            {exercises.length > 0 ? (
                <View style={styles.container}>
                    {exercises.map((exercise) => (
                        <View key={exercise.exerciseId} style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
                            <Link style={[styles.exercise, { color: theme.colors.text }]} href={{
                                pathname: '/exercise/[id]',
                                params: { id: exercise.exerciseId }
                            }}>
                                {exercise.exerciseName}
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