import React, { useCallback, useState } from "react";
import { SafeAreaView, StyleSheet, View, TouchableOpacity, Text, Alert, TextInput, Modal, Animated, Dimensions } from "react-native";
import { Link, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { TouchableRipple } from 'react-native-paper';
import Loader from "@/src/components/loader";
import { useAuth } from "@/src/context/AuthContext";
import { useThemeContext } from "@/src/context/ThemeContext";
import { i18n } from "@/src/i18n/i18n";
import { Session } from "@/src/model/types";
import { apiService } from "@/src/services/api";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProgramScreen() {
    const [sessions, setSessions] = useState<Session[] | null>(null);
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [newName, setNewName] = useState('');
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const slideAnim = useState(new Animated.Value(SCREEN_HEIGHT))[0];
    const { id: workoutId } = useLocalSearchParams();
    const { theme } = useThemeContext();
    const router = useRouter();
    const { userId } = useAuth();

    const openModal = (session: Session) => {
        setSelectedSession(session);
        setModalVisible(true);
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
        }).start();
    };

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setModalVisible(false);
            setSelectedSession(null);
        });
    };

    const fetchSessions = useCallback(async () => {
        try {
            const response = await apiService.get<Session[]>(`/Session/ByWorkoutId/${workoutId}`);
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
                    style: 'cancel',
                    onPress: () => {
                        closeModal();
                    }
                },
                {
                    text: i18n.t('alert.ok'),
                    onPress: async () => {
                        try {
                            await apiService.delete(`/Session/${sessionId}`);
                            closeModal();
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
        closeModal();
        router.push({
            pathname: '/session/edit',
            params: { id: session.id }
        });
    };

    const saveRename = async () => {
        if (!editingSession || !newName.trim()) return;

        try {
            await apiService.put(`/Session/${editingSession.id}`, {
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
                                            <TouchableOpacity
                                                onPress={() => openModal(session)}
                                                style={styles.menuButton}
                                            >
                                                <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.text} />
                                            </TouchableOpacity>
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

            <Modal
                visible={isModalVisible}
                transparent
                animationType="none"
                onRequestClose={closeModal}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={closeModal}
                >
                    <Animated.View
                        style={[
                            styles.modalContent,
                            {
                                backgroundColor: theme.colors.surfaceVariant,
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}
                    >
                        <View style={styles.modalHandle} />
                        <TouchableRipple
                            onPress={() => selectedSession && handleRename(selectedSession)}
                            style={styles.modalItem}
                        >
                            <View style={styles.modalItemContent}>
                                <Ionicons name="pencil" size={24} color={theme.colors.primary} />
                                <Text style={[styles.modalItemText, { color: theme.colors.text }]}>
                                    {i18n.t('session.rename')}
                                </Text>
                            </View>
                        </TouchableRipple>
                        <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
                        <TouchableRipple
                            onPress={() => {
                                selectedSession && handleDelete(selectedSession.id);
                            }}
                            style={styles.modalItem}
                        >
                            <View style={styles.modalItemContent}>
                                <Ionicons name="trash" size={24} color={theme.colors.error} />
                                <Text style={[styles.modalItemText, { color: theme.colors.error }]}>
                                    {i18n.t('session.delete')}
                                </Text>
                            </View>
                        </TouchableRipple>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
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
    menuButton: {
        padding: 8,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    modalHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#ccc',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 10,
    },
    modalItem: {
        padding: 16,
    },
    modalItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalItemText: {
        marginLeft: 16,
        fontSize: 16,
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
    },
});