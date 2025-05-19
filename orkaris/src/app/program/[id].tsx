import Loader from "@/src/components/loader";
import { useAuth } from "@/src/context/AuthContext";
import { useThemeContext } from "@/src/context/ThemeContext";
import { i18n } from "@/src/i18n/i18n";
import { Session } from "@/src/model/types";
import { apiService } from "@/src/services/api";
import { Link, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { SafeAreaView, StyleSheet, View, Button, Text } from "react-native";

export default function ProgramScreen() {
    const [sessions, setSessions] = useState<Session[] | null>(null);
    const { id: workoutId } = useLocalSearchParams();
    const { theme } = useThemeContext();
    const navigation = useRouter();
    const { userId } = useAuth();

    const fetchSessions = useCallback(async () => {
        try {
            const response = await apiService.get<Session[]>(`/Session/ByUserId/${userId}/BySessionId/${workoutId}`);
            setSessions(response);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchSessions();
        }, [fetchSessions])
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            {sessions ? (
                <View style={styles.container}>
                    {sessions.length > 0 ? (
                        <>
                            {sessions.map((session) => (
                                <View key={session.id} style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
                                    <Link style={[styles.session, { color: theme.colors.text }]} href={{
                                        pathname: '/session/[id]',
                                        params: { id: session.id }
                                    }}>
                                        {session.name}
                                    </Link>
                                </View>
                            ))}
                        </>
                    ) : (
                        <Text style={{ color: theme.colors.text }}>
                            {i18n.t('session.no_session')}
                        </Text>
                    )}

                    <Button
                        title={i18n.t('session.new')}
                        onPress={() => navigation.navigate({
                            pathname: "/session/new",
                            params: { id: workoutId }
                        })}
                    />
                </View>
            ) : (
                <Loader />
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
    session: {
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 16,
    },
});