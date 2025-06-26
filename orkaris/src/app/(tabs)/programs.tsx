import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert, TextInput, Modal, Animated, Dimensions } from 'react-native';
import { apiService } from '@/src/services/api';
import { Program, Session, Exercise } from '@/src/model/types';
import { useThemeContext } from '@/src/context/ThemeContext';
import Loader from '@/src/components/loader';
import { i18n } from '@/src/i18n/i18n';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useLanguageContext } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { TouchableRipple } from 'react-native-paper';
import { Linking } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProgramsScreen() {
    const [programs, setPrograms] = useState<Program[] | null>(null);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);
    const [newName, setNewName] = useState('');
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [programSessions, setProgramSessions] = useState<{ [programId: string]: Session[] }>({});
    const [sessionExercises, setSessionExercises] = useState<{ [sessionId: string]: Exercise[] }>({});
    const slideAnim = useState(new Animated.Value(SCREEN_HEIGHT))[0];
    const { theme } = useThemeContext();
    const { language } = useLanguageContext();
    const navigation = useRouter();
    const { userId, userToken } = useAuth();

    const openModal = (program: Program) => {
        setSelectedProgram(program);
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
            setSelectedProgram(null);
        });
    };

    const fetchPrograms = useCallback(async () => {
        try {
            const response = await apiService.get<Program[]>(`/Workout/ByUserId/${userId}`);
            setPrograms(response);

            // Pour chaque programme, récupérer ses sessions
            const sessionsMap: { [programId: string]: Session[] } = {};
            const exercisesMap: { [sessionId: string]: Exercise[] } = {};

            await Promise.all(
                response.map(async (program) => {
                    try {
                        const sessions = await apiService.get<Session[]>(`/Session/ByWorkoutId/${program.id}`);
                        sessionsMap[program.id] = sessions;

                        // Pour chaque session, récupérer ses exercices
                        await Promise.all(
                            sessions.map(async (session) => {
                                try {
                                    // On suppose que l'API /Session/{id} renvoie les exercices dans sessionExerciseSession
                                    const sessionDetail = await apiService.get<any>(`/Session/${session.id}`);
                                    // sessionDetail.sessionExerciseSession est un tableau d'objets contenant les infos d'exercice
                                    if (sessionDetail.sessionExerciseSession) {
                                        exercisesMap[session.id] = sessionDetail.sessionExerciseSession.map((ex: any) => ({
                                            id: ex.exerciseGoalSessionExercise.exerciseExerciseGoal.id,
                                            name: ex.exerciseGoalSessionExercise.exerciseExerciseGoal.name,
                                            // Ajout d'un fallback pour sets, reps, weight si non présents dans Exercise
                                            sets: ex.exerciseGoalSessionExercise.sets ?? '',
                                            reps: ex.exerciseGoalSessionExercise.reps ?? '',
                                            weight: ex.exerciseGoalSessionExercise.weight ?? '',
                                        }));
                                    } else {
                                        exercisesMap[session.id] = [];
                                    }
                                } catch {
                                    exercisesMap[session.id] = [];
                                }
                            })
                        );
                    } catch (e) {
                        sessionsMap[program.id] = [];
                    }
                })
            );
            setProgramSessions(sessionsMap);
            setSessionExercises(exercisesMap);
        } catch (error) {
            console.error('Error fetching workouts:', error);
        }
    }, [userId]);

    const handleDelete = async (programId: string) => {
        try {
            await apiService.delete(`/Workout/${programId}`);
            closeModal();
            fetchPrograms();
        } catch (error) {
            console.error('Error deleting program:', error);
            Alert.alert(i18n.t('alert.error'), 'Error deleting program');
        }
    };

    const handleRename = async (program: Program) => {
        closeModal();
        setEditingProgram(program);
        setNewName(program.name);
    };

    const saveRename = async () => {
        if (!editingProgram || !newName.trim()) return;

        try {
            await apiService.put(`/Workout/${editingProgram.id}`, {
                ...editingProgram,
                name: newName.trim()
            });
            setEditingProgram(null);
            setNewName('');
            fetchPrograms();
        } catch (error) {
            console.error('Error renaming program:', error);
            Alert.alert(i18n.t('alert.error'), 'Error renaming program');
        }
    };

    // Génère un texte de partage structuré pour X (Twitter)
    const generateShareText = () => {
        if (!programs || programs.length === 0) {
            return i18n.t('program.no_program');
        }
        let text = "🏋️ My Training Programs:\n";
        programs.forEach((program, idx) => {
            text += `\n${idx + 1}. ${program.name}`;
            const sessions = programSessions[program.id] || [];
            if (sessions.length > 0) {
                sessions.forEach((session) => {
                    text += `\n   - Session: ${session.name}`;
                    const exercises = sessionExercises[session.id] || [];
                    if (exercises.length > 0) {
                        exercises.forEach((ex: any) => {
                            // Utilise les propriétés sets/reps/weight si elles existent, sinon affiche juste le nom
                            if (ex.sets && ex.reps) {
                                text += `\n      • ${ex.name} (${ex.sets}x${ex.reps}${ex.weight ? ' ' + ex.weight + 'kg' : ''})`;
                            } else {
                                text += `\n      • ${ex.name}`;
                            }
                        });
                    }
                });
            }
        });
        text += "\n\n#Orkaris";
        return text;
    };

    useFocusEffect(
        useCallback(() => {
            fetchPrograms();
        }, [fetchPrograms])
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            {programs ? (
                <View style={styles.container}>
                    {programs.length > 0 ? (
                        <>
                            {programs.map((program) => (
                                <View key={program.id} style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
                                    {editingProgram?.id === program.id ? (
                                        <View style={styles.editContainer}>
                                            <TextInput
                                                style={[styles.input, { color: theme.colors.text }]}
                                                value={newName}
                                                onChangeText={setNewName}
                                                placeholder={i18n.t('program.new_name')}
                                                placeholderTextColor={theme.colors.textSecondary}
                                            />
                                            <View style={styles.editActions}>
                                                <TouchableOpacity onPress={() => setEditingProgram(null)}>
                                                    <Ionicons name="close" size={24} color={theme.colors.error} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={saveRename}>
                                                    <Ionicons name="checkmark" size={24} color={theme.colors.primary} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (
                                        <View style={styles.programContainer}>
                                            <Link style={styles.programLink} href={{
                                                pathname: '/program/[id]',
                                                params: { id: program.id }
                                            }}>
                                                <Text style={[styles.program, { color: theme.colors.text }]}>
                                                    {program.name}
                                                </Text>
                                            </Link>
                                            <TouchableOpacity
                                                onPress={() => openModal(program)}
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
                        <Text style={[styles.noProgram, { color: theme.colors.text }]}>{i18n.t('program.no_program')}</Text>
                    )}
                </View>
            ) : (
                <Loader />
            )}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation.navigate("/program/new")}
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
                        {/* Les boutons sont maintenant les uns en dessous des autres */}
                        <TouchableRipple
                            onPress={() => selectedProgram && handleRename(selectedProgram)}
                            style={styles.modalItem}
                        >
                            <View style={styles.modalItemContent}>
                                <Ionicons name="pencil" size={24} color={theme.colors.primary} />
                                <Text style={[styles.modalItemText, { color: theme.colors.text }]}>
                                    {i18n.t('program.rename')}
                                </Text>
                            </View>
                        </TouchableRipple>
                        <TouchableOpacity
                            style={[styles.modalItem]}
                            onPress={() => {
                                if (selectedProgram) {
                                    const tweetText = encodeURIComponent(
                                        (() => {
                                            let text = `🏋️ ${selectedProgram.name}`;
                                            const sessions = programSessions[selectedProgram.id] || [];
                                            if (sessions.length > 0) {
                                                sessions.forEach((session) => {
                                                    text += `\n   - Session: ${session.name}`;
                                                    const exercises = sessionExercises[session.id] || [];
                                                    if (exercises.length > 0) {
                                                        exercises.forEach((ex: any) => {
                                                            if (ex.sets && ex.reps) {
                                                                text += `\n      • ${ex.name} (${ex.sets}x${ex.reps}${ex.weight ? ' ' + ex.weight + 'kg' : ''})`;
                                                            } else {
                                                                text += `\n      • ${ex.name}`;
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                            text += "\n\n#Orkaris";
                                            return text;
                                        })()
                                    );
                                    const url = `https://twitter.com/intent/tweet?text=${tweetText}`;
                                    Linking.openURL(url);
                                }
                            }}
                        >
                            <View style={styles.modalItemContent}>
                                <Text style={{ fontSize: 24, color: theme.colors.primary, fontWeight: 'bold', marginRight: 2 }}>𝕏</Text>
                                <Text style={[styles.modalItemText, { color: "white" }]}>
                                    Partager sur X
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableRipple
                            onPress={() => selectedProgram && handleDelete(selectedProgram.id)}
                            style={styles.modalItem}
                        >
                            <View style={styles.modalItemContent}>
                                <Ionicons name="trash"  color={theme.colors.error} />
                                <Text style={[styles.modalItemText, { color: theme.colors.error }]}>
                                    {i18n.t('program.delete')}
                                </Text>
                            </View>
                        </TouchableRipple>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
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
    card: {
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
    },
    programContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    programLink: {
        flex: 1,
    },
    program: {
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
    noProgram: {
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
    twitterButton: {
        display: 'none',
    },
    twitterButtonModal: {
        display: 'none',
    },
    xShareButton: {
        backgroundColor: '#000',
        borderRadius: 8,
        marginHorizontal: 16,
        marginVertical: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
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
// Note: This file is part of the Orkaris app, a fitness tracking application.
