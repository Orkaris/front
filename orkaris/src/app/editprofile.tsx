import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity, // Pour rendre la date cliquable
    Alert,
    Text as RNText, // Renommer pour clarté
} from 'react-native';
import {
    Headline,
    TextInput,
    Button,
    IconButton,
    useTheme,
    ActivityIndicator,
    HelperText, // Pour afficher les erreurs de validation
    Text as PaperText
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { apiService } from '../services/api'; // Notre client Axios configuré
import { User } from '../model/types'; // Importer le type User
import { RootStackParamList } from '../model/types'; // Votre type de navigation global

// Définir le type des paramètres de route pour cet écran
type EditProfileScreenRouteProp = RouteProp<RootStackParamList, 'editProfile'>;

// Définir le type de navigation pour cet écran
type EditProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'editProfile'>;

// Fonction utilitaire pour formater la date (similaire à celle de ProfileScreen)
const formatDateForDisplay = (date: Date | null | undefined): string => {
    if (!date) return 'Sélectionner une date';
    try {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    } catch (e) {
        return 'Date invalide';
    }
};

// Interface pour l'état du formulaire
interface EditProfileFormData {
    name: string;
    weight: string; // Utiliser string pour les inputs, convertir avant envoi
    height: string; // Utiliser string pour les inputs, convertir avant envoi
    birthDate: Date | null; // Utiliser Date pour le picker
}

// Interface pour les erreurs de validation
interface FormErrors {
    name?: string;
    weight?: string;
    height?: string;
    birthDate?: string;
}

const EditProfileScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<EditProfileScreenNavigationProp>();
    const route = useRoute<EditProfileScreenRouteProp>();
    const { currentUser } = route.params; // Récupérer l'utilisateur passé en paramètre

    const [formData, setFormData] = useState<EditProfileFormData>({
        name: currentUser?.name || '',
        weight: currentUser?.weight?.toString() || '',
        height: currentUser?.height?.toString() || '',
        birthDate: currentUser?.birthDate ? new Date(currentUser.birthDate) : null,
    });
    const [initialData, setInitialData] = useState<EditProfileFormData | null>(null); // Pour détecter les changements
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Stocker les données initiales pour comparer les changements
    useEffect(() => {
        setInitialData({ ...formData });
    }, []); // Exécuter une seule fois au montage

    // Vérifier si des changements ont été effectués
    const hasChanges = initialData ? JSON.stringify(formData) !== JSON.stringify(initialData) : false;

    // Gérer les changements dans les TextInput
    const handleInputChange = (name: keyof EditProfileFormData, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        // Effacer l'erreur pour ce champ lors de la saisie
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    // Gérer le changement de date depuis le DateTimePicker
    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios'); // Sur iOS, on peut vouloir le garder ouvert
        if (event.type === 'set' && selectedDate) {
            setFormData(prev => ({ ...prev, birthDate: selectedDate }));
             if (errors.birthDate) {
                setErrors(prev => ({ ...prev, birthDate: undefined }));
            }
        } else if (event.type === 'dismissed') {
             // L'utilisateur a annulé (Android)
        }
    };

    // Fonction de validation simple
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Le nom est requis.';
        }
        const weightNum = parseFloat(formData.weight);
        if (formData.weight && (isNaN(weightNum) || weightNum <= 0)) {
            newErrors.weight = 'Veuillez entrer un poids valide (nombre positif).';
        }
        const heightNum = parseFloat(formData.height);
        if (formData.height && (isNaN(heightNum) || heightNum <= 0)) {
            newErrors.height = 'Veuillez entrer une taille valide (nombre positif).';
        }
        if (!formData.birthDate) {
            newErrors.birthDate = 'La date de naissance est requise.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // True si pas d'erreurs
    };

    // Gérer la sauvegarde des modifications
    const handleSave = async () => {
        if (!validateForm()) {
            return; // Arrêter si la validation échoue
        }

        setIsSubmitting(true);
        setErrors({}); // Reset errors before submit

        // Préparer les données pour l'API (convertir en nombres, formater la date)
        const payload = {
            name: formData.name.trim(),
            // Envoyer null si vide, sinon convertir en nombre
            weight: formData.weight ? parseFloat(formData.weight) : undefined, // Utiliser undefined si PATCH, ou null si PUT attend tout
            height: formData.height ? parseFloat(formData.height) : undefined,
            // Convertir la date en string ISO pour l'API
            birthDate: formData.birthDate ? formData.birthDate.toISOString() : undefined,
        };

        // Filtrer les clés undefined si on utilise PATCH (pour ne pas écraser avec null côté back)
        // Si vous utilisez PUT, envoyez toutes les clés (payload complet)
        const patchPayload = Object.fromEntries(
             Object.entries(payload).filter(([_, v]) => v !== undefined)
        );


        try {
            // === ADAPTER L'ENDPOINT ET LA MÉTHODE (PUT ou PATCH) ===
            // Utiliser PATCH est souvent mieux pour les mises à jour partielles
            const response = await apiService.put<User>('/users/me', patchPayload); // Ou .put('/users/me', payload)

            console.log('Profil mis à jour:', response);
            Alert.alert('Succès', 'Votre profil a été mis à jour.');
            // Mettre à jour les données initiales pour refléter l'état sauvegardé
            setInitialData({
                ...formData,
                birthDate: formData.birthDate ? new Date(formData.birthDate) : null // Assurer que c'est bien une date
             });
            navigation.goBack(); // Revenir à l'écran Profil (qui se rechargera grâce au listener 'focus')

        } catch (err: any) {
            console.error("Erreur sauvegarde profil:", err.response?.data || err.message);
            const apiError = err.response?.data?.message || err.response?.data?.error || "Une erreur est survenue.";
            // Afficher une erreur spécifique si possible, sinon une générique
             setErrors(prev => ({ ...prev, general: apiError })); // Afficher une erreur générale
            Alert.alert("Erreur", `Impossible de sauvegarder les modifications: ${apiError}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoiding}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // Ajuster si nécessaire
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.container}>
                        {/* Header avec bouton retour et titre */}
                        <View style={styles.headerRow}>
                            <IconButton
                                icon="arrow-left"
                                size={28}
                                onPress={() => navigation.goBack()}
                                accessibilityLabel="Retour"
                            />
                            <Headline style={[styles.title, { color: theme.colors.onBackground }]}>
                                Modifier le Profil
                            </Headline>
                            <View style={{ width: 40 }} /> {/* Spacer pour centrer le titre */}
                        </View>

                        {/* Formulaire */}
                        <TextInput
                            label="Nom"
                            value={formData.name}
                            onChangeText={(text) => handleInputChange('name', text)}
                            mode="outlined"
                            style={styles.input}
                            theme={{ roundness: 15 }}
                            error={!!errors.name}
                            disabled={isSubmitting}
                        />
                        <HelperText type="error" visible={!!errors.name}>
                            {errors.name}
                        </HelperText>

                        <TextInput
                            label="Poids (kg)"
                            value={formData.weight}
                            onChangeText={(text) => handleInputChange('weight', text.replace(/[^0-9.]/g, ''))} // Autoriser chiffres et point
                            mode="outlined"
                            style={styles.input}
                            keyboardType="numeric"
                            theme={{ roundness: 15 }}
                            error={!!errors.weight}
                            disabled={isSubmitting}
                        />
                         <HelperText type="error" visible={!!errors.weight}>
                            {errors.weight}
                        </HelperText>

                        <TextInput
                            label="Taille (cm)"
                            value={formData.height}
                            onChangeText={(text) => handleInputChange('height', text.replace(/[^0-9]/g, ''))} // Autoriser chiffres seulement
                            mode="outlined"
                            style={styles.input}
                            keyboardType="numeric"
                            theme={{ roundness: 15 }}
                            error={!!errors.height}
                            disabled={isSubmitting}
                        />
                         <HelperText type="error" visible={!!errors.height}>
                            {errors.height}
                        </HelperText>

                        {/* Champ Date de Naissance */}
                        <PaperText style={[styles.dateLabel, { color: theme.colors.backdrop }]}>
                            Date de naissance
                        </PaperText>
                        <TouchableOpacity
                            style={[
                                styles.datePickerButton,
                                { borderColor: errors.birthDate ? theme.colors.error : theme.colors.outline },
                                { backgroundColor: theme.colors.surfaceVariant } // Fond léger pour le différencier
                            ]}
                            onPress={() => !isSubmitting && setShowDatePicker(true)}
                             disabled={isSubmitting}
                        >
                            <PaperText style={[styles.datePickerText, { color: theme.colors.onSurfaceVariant }]}>
                                {formatDateForDisplay(formData.birthDate)}
                            </PaperText>
                            <IconButton icon="calendar" size={20} style={{ margin: 0 }}/>
                        </TouchableOpacity>
                         <HelperText type="error" visible={!!errors.birthDate}>
                            {errors.birthDate}
                        </HelperText>

                        {/* Afficher le DateTimePicker */}
                        {showDatePicker && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={formData.birthDate || new Date()} // Fournir une date valide, même si null
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onDateChange}
                                maximumDate={new Date()} // Empêcher de sélectionner une date future
                                // minimumDate={new Date(1900, 0, 1)} // Optionnel: date minimum
                            />
                        )}


                         {/* Afficher une erreur générale de l'API */}
                         {/* <HelperText type="error" visible={!!errors} style={styles.generalError}>
                            {/* {errors} */}
                        {/* </HelperText> */} 

                        {/* Bouton Sauvegarder */}
                        <Button
                            mode="contained"
                            onPress={handleSave}
                            style={styles.saveButton}
                            contentStyle={styles.buttonContent}
                            labelStyle={styles.buttonLabel}
                            theme={{ roundness: 30 }}
                            loading={isSubmitting}
                            // Désactiver si en soumission OU si aucune modif n'a été faite
                            disabled={isSubmitting || !hasChanges}
                        >
                            {isSubmitting ? '' : 'Sauvegarder les modifications'}
                        </Button>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    keyboardAvoiding: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Pour espacer les éléments
        marginBottom: 20,
    },
    title: {
        fontSize: 24, // Légèrement plus petit que ProfileScreen peut-être
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1, // Pour qu'il prenne l'espace central
    },
    input: {
        // marginBottom est géré par HelperText maintenant
        // backgroundColor: '#fff', // Utilise le thème
    },
    dateLabel: {
        fontSize: 12, // Style de label standard de Paper
        // color: '#666', // Utilise theme.colors.backdrop
        marginTop: 10,
        marginBottom: -4, // Rapprocher du champ date
        marginLeft: 12, // Aligner avec le label des TextInput (approx)
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: 15, // Match TextInput theme
        paddingVertical: 14,
        paddingHorizontal: 15,
        marginTop: 8,
        // borderColor: '#ccc', // Défini dynamiquement
        // backgroundColor: '#f8f8f8', // Défini dynamiquement
    },
    datePickerText: {
        fontSize: 16,
        // color: '#333', // Défini dynamiquement
    },
    saveButton: {
        marginTop: 30,
        marginBottom: 20, // Espace en bas
    },
    buttonContent: {
        paddingVertical: 8,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    generalError: {
        marginTop: 15,
        textAlign: 'center',
        fontSize: 14,
    },
});

export default EditProfileScreen;