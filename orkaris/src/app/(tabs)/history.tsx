import { View, SafeAreaView, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useThemeContext } from "@/src/context/ThemeContext";
import { useState, useEffect } from "react";
import { apiService } from "@/src/services/api";
import { i18n } from "@/src/i18n/i18n";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import Loader from "@/src/components/loader";

interface WorkoutSession {
    id: string;
    date: string;
    session: {
        id: string;
        name: string;
    };
    exerciseGoalPerformances: {
        exerciseGoal: {
            exercise: {
                name: string;
            };
        };
        reps: number;
        sets: number;
    }[];
}

export default function HistoryScreen() {
    const { theme } = useThemeContext();
    const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchWorkouts();
    }, []);

    const fetchWorkouts = async () => {
        try {
            const response = await apiService.get<WorkoutSession[]>('/WorkoutSession');
            // Trier les séances par date (du plus récent au plus ancien)
            const sortedWorkouts = response.sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setWorkouts(sortedWorkouts);
        } catch (error) {
            console.error('Error fetching workouts:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderWorkoutItem = ({ item }: { item: WorkoutSession }) => (
        <TouchableOpacity
            style={[styles.workoutCard, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => router.push({
                pathname: '/session/[id]',
                params: { id: item.session.id }
            })}
        >
            <View style={styles.workoutHeader}>
                <Text style={[styles.sessionName, { color: theme.colors.text }]}>
                    {item.session.name}
                </Text>
                <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
                    {dayjs(item.date).format('DD/MM/YYYY HH:mm')}
                </Text>
            </View>
            <View style={styles.exercisesList}>
                {item.exerciseGoalPerformances.map((performance, index) => (
                    <Text key={index} style={[styles.exerciseText, { color: theme.colors.textSecondary }]}>
                        • {performance.exerciseGoal.exercise.name}: {performance.sets} sets × {performance.reps} reps
                    </Text>
                ))}
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return <Loader />
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    {i18n.t('history.title')}
                </Text>
            </View>
            {workouts.length > 0 ? (
                <FlatList
                    data={workouts}
                    renderItem={renderWorkoutItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                        {i18n.t('history.no_workouts')}
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    listContainer: {
        padding: 20,
    },
    workoutCard: {
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
    },
    workoutHeader: {
        marginBottom: 10,
    },
    sessionName: {
        fontSize: 18,
        fontWeight: '500',
    },
    date: {
        fontSize: 14,
        marginTop: 5,
    },
    exercisesList: {
        marginTop: 5,
    },
    exerciseText: {
        fontSize: 14,
        marginBottom: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});