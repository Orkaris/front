import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert, TextInput, Modal, Animated, Dimensions } from 'react-native';
import { apiService } from '@/src/services/api';
import { Program } from '@/src/model/types';
import { useThemeContext } from '@/src/context/ThemeContext';
import Loader from '@/src/components/loader';
import { i18n } from '@/src/i18n/i18n';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useLanguageContext } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { TouchableRipple } from 'react-native-paper';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ProgramsScreen() {
    const [programs, setPrograms] = useState<Program[] | null>(null);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);
    const [newName, setNewName] = useState('');
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [isModalVisible, setModalVisible] = useState(false);
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
                        <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
                        <TouchableRipple 
                            onPress={() => selectedProgram && handleDelete(selectedProgram.id)}
                            style={styles.modalItem}
                        >
                            <View style={styles.modalItemContent}>
                                <Ionicons name="trash" size={24} color={theme.colors.error} />
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
