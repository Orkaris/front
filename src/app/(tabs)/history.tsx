import { View, SafeAreaView, Text, StyleSheet, FlatList } from "react-native";
import { useThemeContext } from "@/src/context/ThemeContext";
import { useState, useEffect, useCallback } from "react";
import { apiService } from "@/src/services/api";
import { i18n } from "@/src/i18n/i18n";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import Loader from "@/src/components/loader";
import HistoryCard from "@/src/components/HistoryCard";
import { SessionPerformance, ExerciseGoalPerformance } from "@/src/model/types";

interface SessionExercise {
    exerciseGoalSessionExercise: {
        id: string;
        reps: number;
        sets: number;
        exerciseExerciseGoal: {
            id: string;
            name: string;
        };
    };
}

interface Session {
    id: string;
    name: string;
    userId: string;
    workoutId: string;
    createdAt: string;
    sessionExerciseSession: SessionExercise[];
}

export default function HistoryScreen() {
    const { theme } = useThemeContext();
    const [sessions, setSessions] = useState<SessionPerformance[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { userId } = useAuth();

    const fetchSessions = useCallback(async () => {
        try {
            const response = await apiService.get<SessionPerformance[]>(`/SessionPerformance/user/${userId}`);

            if (response.length === 0) {
                setSessions([]);
                return;
            }

            const filteredSessions = response.map((session: SessionPerformance) => {
                return {
                    ...session,
                    exerciseGoalPerformances: session.exerciseGoalPerformances.filter((performance: ExerciseGoalPerformance) => {
                        const sessionDateTime = new Date(session.date).toISOString().split('.')[0]; // YYYY-MM-DDTHH:MM:SS
                        const performanceDateTime = new Date(performance.createdAt).toISOString().split('.')[0]; // YYYY-MM-DDTHH:MM:SS
                        return performanceDateTime === sessionDateTime;
                    })
                };
            });

            const sortedSessions = filteredSessions.sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setSessions(sortedSessions);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useFocusEffect(
        useCallback(() => {
            fetchSessions();
        }, [fetchSessions])
    );

    if (loading) {
        return <Loader />;
    }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            {sessions.length > 0 ? (
                <FlatList
                    data={sessions}
                    renderItem={({ item }) => (
                        <HistoryCard
                            id={item.id}
                            sessionName={item.sessionName}
                            date={item.date}
                            exerciseGoalPerformances={item.exerciseGoalPerformances}
                            onPress={() => router.push({
                                pathname: '/session/[id]',
                                params: { id: item.sessionId }
                            })}
                        />
                    )}
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