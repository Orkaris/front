import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert, TextInput } from 'react-native';
import { apiService } from '@/src/services/api';
import { Program } from '@/src/model/types';
import { useThemeContext } from '@/src/context/ThemeContext';
import Loader from '@/src/components/loader';
import { i18n } from '@/src/i18n/i18n';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useLanguageContext } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProgramsScreen() {
    const [programs, setPrograms] = useState<Program[] | null>(null);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);
    const [newName, setNewName] = useState('');
    const { theme } = useThemeContext();
    const { language } = useLanguageContext();
    const navigation = useRouter();
    const { userId, userToken } = useAuth();

    const fetchPrograms = useCallback(async () => {
        try {
            const response = await apiService.get<Program[]>(`/Workout/ByUserId/${userId}`);
            setPrograms(response);
        } catch (error) {
            console.error('Error fetching workouts:', error);
        }
    }, [userId]);

    const handleDelete = async (programId: string) => {
        Alert.alert(
            i18n.t('program.delete'),
            i18n.t('program.delete_confirmation'),
            [
                {
                    text: i18n.t('alert.cancel'),
                    style: 'cancel'
                },
                {
                    text: i18n.t('alert.ok'),
                    onPress: async () => {
                        try {
                            await apiService.delete(`/Workout/${programId}/${userId}`);
                            fetchPrograms();
                        } catch (error) {
                            console.error('Error deleting program:', error);
                            Alert.alert(i18n.t('alert.error'), 'Error deleting program');
                        }
                    }
                }
            ]
        );
    };

    const handleRename = async (program: Program) => {
        setEditingProgram(program);
        setNewName(program.name);
    };

    const saveRename = async () => {
        if (!editingProgram || !newName.trim()) return;

        try {
            await apiService.put(`/Workout/${editingProgram.id}/${userId}`, {
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
                                            <View style={styles.actions}>
                                                <TouchableOpacity onPress={() => handleRename(program)} style={styles.actionButton}>
                                                    <Ionicons name="pencil" size={20} color={theme.colors.primary} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => handleDelete(program.id)} style={styles.actionButton}>
                                                    <Ionicons name="trash" size={20} color={theme.colors.error} />
                                                </TouchableOpacity>
                                            </View>
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
});
