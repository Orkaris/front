import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useThemeContext } from "@/src/context/ThemeContext";
import { useState, useEffect } from "react";
import { apiService } from "@/src/services/api";
import Loader from "@/src/components/loader";
import { Alert } from "react-native";
import { i18n } from "@/src/i18n/i18n";

interface Exercise {
    id: string;
    name: string;
    description: string;
}

export default function ExerciseScreen() {
    const { id } = useLocalSearchParams();
    const { theme } = useThemeContext();
    const [exercise, setExercise] = useState<Exercise | null>(null);

    useEffect(() => {
        const fetchExercise = async () => {
            try {
                const response = await apiService.get<Exercise>(`/Exercise/${id}`);
                setExercise(response);
            } catch (error) {
                console.error('Error fetching exercise:', error);
                Alert.alert(i18n.t('alert.error'), i18n.t('error.fetching_exercise'));
            }
        };

        if (id) {
            fetchExercise();
        }
    }, [id]);

    if (!exercise) {
        return <Loader />;
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <View style={styles.container}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    {exercise.name}
                </Text>
                <View style={[styles.descriptionContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <Text style={[styles.description, { color: theme.colors.text }]}>
                        {exercise.description}
                    </Text>
                </View>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    descriptionContainer: {
        borderRadius: 8,
        padding: 15,
        elevation: 3,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
});