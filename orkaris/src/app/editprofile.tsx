import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Alert,
} from 'react-native';
import {
    Headline,
    TextInput,
    Button,
    IconButton,
    useTheme,
    HelperText,
    Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
// Retirer useRoute car on n'utilise plus les params
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';

// --- Utiliser apiClient si c'est l'export par défaut, sinon apiService ---
import { apiService } from '../services/api'; // Ou import { apiService } from '...'
// ---------------------------------------------------------------------
import { User } from '../model/types';
import { useAuth } from '../context/AuthContext'; // Importer useAuth
import { useRouter } from 'expo-router';
import Loader from '../components/loader';


const formatDateForDisplay = (date: Date | null | undefined): string => {
    if (!date) return 'Sélectionner une date';
    try {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    } catch (e) {
        return 'Date invalide';
    }
};

interface EditProfileFormData {
    name: string;
    weight: string;
    height: string;
    birthDate: Date | null;
}

interface FormErrors {
    name?: string;
    weight?: string;
    height?: string;
    birthDate?: string;
    general?: string; // Pour les erreurs API
}

export default function EditProfileScreen() {
    const theme = useTheme();
    const navigation = useRouter();
    const { userId, signOut } = useAuth(); // Récupérer userId et signOut depuis le contexte

    // États pour les données et le formulaire
    const [user, setUser] = useState<User | null>(null); // Pour stocker les données fetchées
    const [isLoading, setIsLoading] = useState(true); // Pour le chargement initial
    const [error, setError] = useState<string | null>(null); // Pour les erreurs de fetch
    const [formData, setFormData] = useState<EditProfileFormData>({ name: '', weight: '', height: '', birthDate: null });
    const [initialData, setInitialData] = useState<EditProfileFormData>({ name: '', weight: '', height: '', birthDate: null });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false); // Pour la sauvegarde
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Fonction pour charger les données utilisateur pour l'édition
    const fetchDataForEdit = useCallback(async () => {
        if (!userId) {
            console.log("fetchDataForEdit: userId non disponible, arrêt.");
            setError("Impossible d'identifier l'utilisateur."); // Afficher une erreur si pas d'ID
            setIsLoading(false);
            return;
        }

        console.log(`fetchDataForEdit: Appel API pour userId: ${userId}`);
        setIsLoading(true); // Commencer le chargement
        setError(null); // Réinitialiser l'erreur

        try {
            // Utiliser la même requête que ProfileScreen
            const fetchedUser = await apiService.get<User>(`/Users/ById/${userId}`); // Utiliser apiClient

            if (fetchedUser) {
                console.log("User data received for edit:", fetchedUser);
                setUser(fetchedUser); // Stocker l'utilisateur complet

                // --- Initialiser formData et initialData APRÈS le fetch ---
                const initialFormState = {
                    name: fetchedUser.name || '',
                    weight: fetchedUser.weight?.toString() || '',
                    height: fetchedUser.height?.toString() || '',
                    birthDate: fetchedUser.birthDate ? new Date(fetchedUser.birthDate) : null,
                };
                setFormData(initialFormState);
                setInitialData(initialFormState); // Sauvegarder l'état initial pour comparaison
                // -------------------------------------------------------

            } else {
                throw new Error("Aucune donnée utilisateur reçue de l'API.");
            }
        } catch (err: any) {
            console.error("Erreur fetchDataForEdit:", err.response?.data || err.message);
            setError("Impossible de charger les informations du profil.");
            setUser(null); // Réinitialiser user en cas d'erreur
            // Réinitialiser les formulaires aussi ?
            setFormData({ name: '', weight: '', height: '', birthDate: null });
            setInitialData({ name: '', weight: '', height: '', birthDate: null });
            if (err.response?.status === 401 || err.response?.status === 403) {
                Alert.alert("Session expirée", "Veuillez vous reconnecter.", [{ text: "OK", onPress: signOut }]);
            } else {
                Alert.alert("Erreur", "Impossible de charger les informations pour modification.");
            }
        } finally {
            setIsLoading(false); // Fin du chargement
        }
    }, [userId, apiService, signOut]); // Dépendances : userId, apiClient, signOut

    // Utiliser useFocusEffect pour charger les données quand l'écran est focus
    useFocusEffect(
        useCallback(() => {
            console.log("EditProfileScreen focused, fetching data...");
            fetchDataForEdit();
        }, [fetchDataForEdit]) // Dépend de fetchDataForEdit (qui dépend de userId)
    );

    // Vérifier si des changements ont été effectués
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

    // handleInputChange, onDateChange, validateForm (inchangés) ...
    const handleInputChange = (name: keyof EditProfileFormData, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined, general: undefined }));
        }
    };
    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (event.type === 'set' && selectedDate) {
            setFormData(prev => ({ ...prev, birthDate: selectedDate }));
            if (errors.birthDate) {
                setErrors(prev => ({ ...prev, birthDate: undefined, general: undefined }));
            }
        }
    };
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Le nom est requis.';
        const weightNum = parseFloat(formData.weight);
        if (formData.weight && (isNaN(weightNum) || weightNum <= 0)) newErrors.weight = 'Poids invalide.';
        const heightNum = parseFloat(formData.height);
        if (formData.height && (isNaN(heightNum) || heightNum <= 0)) newErrors.height = 'Taille invalide.';
        if (!formData.birthDate) newErrors.birthDate = 'Date de naissance requise.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Gérer la sauvegarde des modifications (endpoint /users/me reste probablement le bon)
    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        const payload = {
            name: formData.name.trim(),
            weight: formData.weight ? parseFloat(formData.weight) : null,
            height: formData.height ? parseFloat(formData.height) : null,
            birthDate: formData.birthDate ? dayjs(formData.birthDate).format('YYYY-MM-DD') : null,
        };
        const finalPayload = payload;

        try {
            // Utiliser PATCH sur /users/me pour modifier l'utilisateur connecté
            console.log("Envoi de la mise à jour vers /users :", finalPayload);
            const response = await apiService.put<User>(`/users/${userId}`, finalPayload);

            console.log('Profil mis à jour, réponse API:', response);
            Alert.alert('Succès', 'Votre profil a été mis à jour.');
            navigation.back();

        } catch (err: any) {
            console.error("Erreur sauvegarde profil:", err.response?.data || err.message || err);
            const apiError = err.response?.data?.message || err.response?.data?.error || "Une erreur réseau ou serveur est survenue.";
            setErrors(prev => ({ ...prev, general: apiError }));
            Alert.alert("Échec de la sauvegarde", apiError);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Rendu Conditionnel pour le Chargement Initial ---
    if (isLoading) {
        return (
            <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
                <Loader />
            </SafeAreaView>
        );
    }

    // --- Rendu Conditionnel pour l'Erreur de Chargement Initial ---
    if (error) {
        return (
            <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
                <Text style={styles.errorText}>{error}</Text>
                <Button mode="outlined" onPress={fetchDataForEdit} icon="refresh">
                    Réessayer
                </Button>
                <Button mode="text" onPress={() => navigation.back()} style={{ marginTop: 10 }}>
                    Retour
                </Button>
            </SafeAreaView>
        );
    }

    // --- Rendu Principal du Formulaire (si chargement OK et pas d'erreur initiale) ---
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoiding}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.container}>
                        {/* Header */}
                        <View style={styles.headerRow}>
                            <IconButton icon="arrow-left" size={28} onPress={() => navigation.back()} />
                            <Headline style={styles.title}>Modifier le Profil</Headline>
                            <View style={{ width: 40 }} />
                        </View>

                        {/* Formulaire (inchangé) */}
                        <TextInput
                            label="Nom"
                            value={formData.name}
                            onChangeText={(text) => handleInputChange('name', text)}
                            mode="outlined" style={styles.input} theme={{ roundness: 15 }}
                            error={!!errors.name} disabled={isSubmitting}
                        />
                        <HelperText type="error" visible={!!errors.name}>{errors.name}</HelperText>

                        <TextInput
                            label="Poids (kg)"
                            value={formData.weight}
                            onChangeText={(text) => handleInputChange('weight', text.replace(/[^0-9.]/g, ''))}
                            mode="outlined" style={styles.input} keyboardType="numeric" theme={{ roundness: 15 }}
                            error={!!errors.weight} disabled={isSubmitting}
                        />
                        <HelperText type="error" visible={!!errors.weight}>{errors.weight}</HelperText>

                        <TextInput
                            label="Taille (cm)"
                            value={formData.height}
                            onChangeText={(text) => handleInputChange('height', text.replace(/[^0-9]/g, ''))}
                            mode="outlined" style={styles.input} keyboardType="numeric" theme={{ roundness: 15 }}
                            error={!!errors.height} disabled={isSubmitting}
                        />
                        <HelperText type="error" visible={!!errors.height}>{errors.height}</HelperText>

                        {/* Date Picker (inchangé) */}
                        <Text style={styles.dateLabel}>Date de naissance</Text>
                        <TouchableOpacity
                            style={[styles.datePickerButton, { borderColor: errors.birthDate ? theme.colors.error : theme.colors.outline }, { backgroundColor: theme.colors.surfaceVariant }]}
                            onPress={() => !isSubmitting && setShowDatePicker(true)} disabled={isSubmitting}
                        >
                            <Text style={styles.datePickerText}>{formatDateForDisplay(formData.birthDate)}</Text>
                            <IconButton icon="calendar" size={20} style={{ margin: 0 }} />
                        </TouchableOpacity>
                        <HelperText type="error" visible={!!errors.birthDate}>{errors.birthDate}</HelperText>
                        {showDatePicker && (
                            <DateTimePicker value={formData.birthDate || new Date()} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onDateChange} maximumDate={new Date()}
                            />
                        )}

                        {/* Erreur Générale API */}
                        <HelperText type="error" visible={!!errors.general} style={styles.generalError}>
                            {errors.general}
                        </HelperText>

                        {/* Bouton Sauvegarder */}
                        <Button
                            mode="contained" onPress={handleSave} style={styles.saveButton}
                            contentStyle={styles.buttonContent} labelStyle={styles.buttonLabel} theme={{ roundness: 30 }}
                            loading={isSubmitting} disabled={isSubmitting || !hasChanges}
                        >
                            {isSubmitting ? '' : 'Sauvegarder'}
                        </Button>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// Styles (inchangés, mais ajout de centerContent et errorText)
const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }, // Style pour chargement/erreur
    errorText: { fontSize: 16, color: 'red', textAlign: 'center', marginBottom: 20 }, // Style pour texte d'erreur
    keyboardAvoiding: { flex: 1 },
    scrollViewContent: { flexGrow: 1 },
    container: { flex: 1, paddingHorizontal: 20, paddingVertical: 10 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', flex: 1 },
    input: { /* Style */ },
    dateLabel: { fontSize: 12, marginTop: 10, marginBottom: -4, marginLeft: 12 },
    datePickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 15, paddingVertical: 14, paddingHorizontal: 15, marginTop: 8 },
    datePickerText: { fontSize: 16 },
    saveButton: { marginTop: 30, marginBottom: 20 },
    buttonContent: { paddingVertical: 8 },
    buttonLabel: { fontSize: 16, fontWeight: 'bold' },
    generalError: { marginTop: 15, textAlign: 'center', fontSize: 14, color: 'red' },
});
