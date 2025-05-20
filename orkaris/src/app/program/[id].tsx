import Loader from "@/src/components/loader";
import { useAuth } from "@/src/context/AuthContext";
import { useThemeContext } from "@/src/context/ThemeContext";
import { i18n } from "@/src/i18n/i18n";
import { Session } from "@/src/model/types";
import { apiService } from "@/src/services/api";
import { Link, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { SafeAreaView, StyleSheet, View, TouchableOpacity, Text, Alert, TextInput } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function ProgramScreen() {
    const [sessions, setSessions] = useState<Session[] | null>(null);
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [newName, setNewName] = useState('');
    const { id: workoutId } = useLocalSearchParams();
    const { theme } = useThemeContext();
    const router = useRouter();
    const { userId } = useAuth();

    const fetchSessions = useCallback(async () => {
        try {
            const response = await apiService.get<Session[]>(`/Session/ByUserId/${userId}/BySessionId/${workoutId}`);
            setSessions(response);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    }, [userId, workoutId]);

    const handleDelete = async (sessionId: string) => {
        Alert.alert(
            i18n.t('session.delete'),
            i18n.t('session.delete_confirmation'),
            [
                {
                    text: i18n.t('alert.cancel'),
                    style: 'cancel'
                },
                {
                    text: i18n.t('alert.ok'),
                    onPress: async () => {
                        try {
                            await apiService.delete(`/Session/${sessionId}/${userId}`);
                            fetchSessions();
                        } catch (error) {
                            console.error('Error deleting session:', error);
                            Alert.alert(i18n.t('alert.error'), 'Error deleting session');
                        }
                    }
                }
            ]
        );
    };

    const handleRename = async (session: Session) => {
        router.push({
            pathname: '/session/edit',
            params: { id: session.id }
        });
    };

    const saveRename = async () => {
        if (!editingSession || !newName.trim()) return;

        try {
            await apiService.put(`/Session/${editingSession.id}/${userId}`, {
                ...editingSession,
                name: newName.trim()
            });
            setEditingSession(null);
            setNewName('');
            fetchSessions();
        } catch (error) {
            console.error('Error renaming session:', error);
            Alert.alert(i18n.t('alert.error'), 'Error renaming session');
        }
    };

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
                                    {editingSession?.id === session.id ? (
                                        <View style={styles.editContainer}>
                                            <TextInput
                                                style={[styles.input, { color: theme.colors.text }]}
                                                value={newName}
                                                onChangeText={setNewName}
                                                placeholder={i18n.t('session.new_name')}
                                                placeholderTextColor={theme.colors.textSecondary}
                                            />
                                            <View style={styles.editActions}>
                                                <TouchableOpacity onPress={() => setEditingSession(null)}>
                                                    <Ionicons name="close" size={24} color={theme.colors.error} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={saveRename}>
                                                    <Ionicons name="checkmark" size={24} color={theme.colors.primary} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={styles.sessionContainer}>
                                            <Link style={styles.sessionLink} href={{
                                                pathname: '/session/[id]',
                                                params: { id: session.id }
                                            }}>
                                                <Text style={[styles.session, { color: theme.colors.text }]}>
                                                    {session.name}
                                                </Text>
                                            </Link>
                                            <View style={styles.actions}>
                                                <TouchableOpacity onPress={() => handleRename(session)} style={styles.actionButton}>
                                                    <Ionicons name="pencil" size={20} color={theme.colors.primary} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => handleDelete(session.id)} style={styles.actionButton}>
                                                    <Ionicons name="trash" size={20} color={theme.colors.error} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </>
                    ) : (
                        <Text style={[styles.noSession, { color: theme.colors.text }]}>
                            {i18n.t('session.no_session')}
                        </Text>
                    )}
                </View>
            ) : (
                <Loader />
            )}
            <TouchableOpacity 
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.navigate({
                    pathname: "/session/new",
                    params: { id: workoutId }
                })}
            >
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
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
    card: {
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
    },
    sessionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sessionLink: {
        flex: 1,
    },
    session: {
        fontSize: 16,
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: 8,
        marginLeft: 8,
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        fontSize: 16,
        padding: 0,
    },
    editActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    noSession: {
        textAlign: 'center',
        fontSize: 16,
        marginTop: 20,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});