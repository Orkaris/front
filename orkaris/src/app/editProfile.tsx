import React, { useState, useCallback } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Alert,
} from "react-native";
import {
    Headline,
    TextInput,
    Button,
    IconButton,
    useTheme,
    HelperText,
    Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
// Retirer useRoute car on n'utilise plus les params
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { Menu } from "react-native-paper";

import { useThemeContext } from "@/src/context/ThemeContext";
// --- Utiliser apiClient si c'est l'export par défaut, sinon apiService ---
import { apiService } from "../services/api"; // Ou import { apiService } from '...'
// ---------------------------------------------------------------------
import { User } from "../model/types";
import { useAuth } from "../context/AuthContext"; // Importer useAuth
import { useRouter } from "expo-router";
import Loader from "../components/loader";
import { i18n } from "../i18n/i18n";
import { createCommonTextInputProps } from "../components/commonTextInputProps";
import CustomButton from "../components/CustomButton";

const formatDateForDisplay = (date: Date | null | undefined): string => {
    if (!date) return "Sélectionner une date";
    try {
        const options: Intl.DateTimeFormatOptions = {
            day: "numeric",
            month: "long",
            year: "numeric",
        };
        return date.toLocaleDateString("fr-FR", options);
    } catch (e) {
        return "Date invalide";
    }
};

interface EditProfileFormData {
    name: string;
    weight: string;
    height: string;
    birthDate: Date | null;
    gender: string;
}

interface FormErrors {
    name?: string;
    weight?: string;
    height?: string;
    birthDate?: string;
    general?: string; // Pour les erreurs API
    gender?: string;
}

export default function EditProfileScreen() {
    const { theme } = useThemeContext();
    const navigation = useRouter();
    const { userId, signOut } = useAuth(); // Récupérer userId et signOut depuis le contexte

    // États pour les données et le formulaire
    const [user, setUser] = useState<User | null>(null); // Pour stocker les données fetchées
    const [isLoading, setIsLoading] = useState(true); // Pour le chargement initial
    const [error, setError] = useState<string | null>(null); // Pour les erreurs de fetch
    const [formData, setFormData] = useState<EditProfileFormData>({
        name: "",
        weight: "",
        height: "",
        birthDate: null,
        gender: "",
    });
    const [initialData, setInitialData] = useState<EditProfileFormData>({
        name: "",
        weight: "",
        height: "",
        birthDate: null,
        gender: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false); // Pour la sauvegarde
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [genderMenuVisible, setGenderMenuVisible] = useState(false);

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
                    name: fetchedUser.name || "",
                    weight: fetchedUser.weight?.toString() || "",
                    height: fetchedUser.height?.toString() || "",
                    birthDate: fetchedUser.birthDate
                        ? new Date(fetchedUser.birthDate)
                        : null,
                    gender: fetchedUser.gender || "",
                };
                setFormData(initialFormState);
                setInitialData(initialFormState); // Sauvegarder l'état initial pour comparaison
                // -------------------------------------------------------
            } else {
                throw new Error("Aucune donnée utilisateur reçue de l'API.");
            }
        } catch (err: any) {
            console.error(
                "Erreur fetchDataForEdit:",
                err.response?.data || err.message
            );
            setError("Impossible de charger les informations du profil.");
            setUser(null); // Réinitialiser user en cas d'erreur
            // Réinitialiser les formulaires aussi ?
            setFormData({ name: "", weight: "", height: "", birthDate: null, gender: "" });
            setInitialData({ name: "", weight: "", height: "", birthDate: null, gender: "" });
            if (err.response?.status === 401 || err.response?.status === 403) {
                Alert.alert("Session expirée", "Veuillez vous reconnecter.", [
                    { text: "OK", onPress: signOut },
                ]);
            } else {
                Alert.alert(
                    "Erreur",
                    "Impossible de charger les informations pour modification."
                );
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
    const handleInputChange = (
        name: keyof EditProfileFormData,
        value: string
    ) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
        }
    };
    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === "ios");
        if (event.type === "set" && selectedDate) {
            setFormData((prev) => ({ ...prev, birthDate: selectedDate }));
            if (errors.birthDate) {
                setErrors((prev) => ({
                    ...prev,
                    birthDate: undefined,
                    general: undefined,
                }));
            }
        }
    };
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.name.trim()) newErrors.name = "Le nom est requis.";
        const weightNum = parseFloat(formData.weight);
        if (formData.weight && (isNaN(weightNum) || weightNum <= 0))
            newErrors.weight = "Poids invalide.";
        const heightNum = parseFloat(formData.height);
        if (formData.height && (isNaN(heightNum) || heightNum <= 0))
            newErrors.height = "Taille invalide.";
        if (!formData.birthDate) newErrors.birthDate = "Date de naissance requise.";
        if (!formData.gender) newErrors.gender = "Le genre est requis.";
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
            birthDate: formData.birthDate
                ? dayjs(formData.birthDate).format("YYYY-MM-DD")
                : null,
            gender: formData.gender, // Inclure le genre
        };
        const finalPayload = payload;

        try {
            // Utiliser PATCH sur /users/me pour modifier l'utilisateur connecté
            console.log("Envoi de la mise à jour vers /users :", finalPayload);
            const response = await apiService.put<User>(
                `/users/${userId}`,
                finalPayload
            );

            console.log("Profil mis à jour, réponse API:", response);
            Alert.alert("Succès", "Votre profil a été mis à jour.");
            navigation.back();
        } catch (err: any) {
            console.error(
                "Erreur sauvegarde profil:",
                err.response?.data || err.message || err
            );
            const apiError =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Une erreur réseau ou serveur est survenue.";
            setErrors((prev) => ({ ...prev, general: apiError }));
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
                <Button
                    mode="text"
                    onPress={() => navigation.back()}
                    style={{ marginTop: 10 }}
                >
                    Retour
                </Button>
            </SafeAreaView>
        );
    }

    // --- Rendu Principal du Formulaire (si chargement OK et pas d'erreur initiale) ---
    return (
        <SafeAreaView
            style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoiding}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.container}>
                        {/* Formulaire (inchangé) */}
                        <TextInput
                            label={i18n.t('edit_profile.name')}
                            value={formData.name}
                            onChangeText={(text) => handleInputChange("name", text)}
                            {...createCommonTextInputProps(theme)}
                            error={!!errors.name}
                            disabled={isSubmitting}
                        />
                        <HelperText type="error" visible={!!errors.name}>
                            {errors.name}
                        </HelperText>

                        <TextInput
                            label={i18n.t('edit_profile.weight')}
                            value={formData.weight}
                            onChangeText={(text) =>
                                handleInputChange("weight", text.replace(/[^0-9.]/g, ""))
                            }
                            {...createCommonTextInputProps(theme)}
                            keyboardType="numeric"
                            error={!!errors.weight}
                            disabled={isSubmitting}
                        />
                        <HelperText type="error" visible={!!errors.weight}>
                            {errors.weight}
                        </HelperText>

                        <TextInput
                            label={i18n.t('edit_profile.height')}
                            value={formData.height}
                            onChangeText={(text) =>
                                handleInputChange("height", text.replace(/[^0-9]/g, ""))
                            }
                            {...createCommonTextInputProps(theme)}
                            keyboardType="numeric"
                            error={!!errors.height}
                            disabled={isSubmitting}
                        />
                        <HelperText type="error" visible={!!errors.height}>
                            {errors.height}
                        </HelperText>

                        {/* Date Picker (inchangé) */}
                        <TextInput
                            label={i18n.t('edit_profile.birthdate')}
                            value={formatDateForDisplay(formData.birthDate)} // Afficher la date formatée
                            editable={false} // Rendre non éditable par clavier
                            mode="outlined" // Assurer le mode outlined
                            {...createCommonTextInputProps(theme)} // Appliquer styles communs
                            error={!!errors.birthDate}
                            disabled={isSubmitting}
                            // Icône calendrier cliquable à droite pour ouvrir le picker
                            right={
                                <TextInput.Icon
                                    icon="calendar"
                                    onPress={() => !isSubmitting && setShowDatePicker(true)}
                                    forceTextInputFocus={false} // Empêche le focus sur l'input en cliquant l'icône
                                    disabled={isSubmitting}
                                />
                            }
                        // Ajouter un onPress sur le TextInput lui-même peut aussi marcher
                        // mais l'icône est plus explicite. Si vous voulez tout le champ cliquable:
                        // render={(props) => (
                        //     <TouchableOpacity onPress={() => !isSubmitting && setShowDatePicker(true)} disabled={isSubmitting}>
                        //         <NativeTextInput {...props} editable={false} pointerEvents="none" />
                        //     </TouchableOpacity>
                        // )}
                        />
                        {/* HelperText pour l'erreur de date */}
                        <HelperText type="error" visible={!!errors.birthDate}>{errors.birthDate}</HelperText>
                        {/* -------------------------------- */}

                        {/* Afficher le DateTimePicker (logique inchangée) */}
                        {showDatePicker && (
                            <DateTimePicker
                                value={formData.birthDate || new Date()}
                                mode="date"
                                display={Platform.OS === "ios" ? "spinner" : "default"}
                                onChange={onDateChange}
                                maximumDate={new Date()}
                            />
                        )}

                        <View>
                            <TextInput
                                label={i18n.t('edit_profile.gender')}
                                value={formData.gender ? i18n.t(`genders.${formData.gender}`) : ""}
                                mode="outlined"
                                editable={false}
                                style={[styles.input, { backgroundColor: theme.colors.background }]}
                                theme={{
                                    roundness: 20,
                                    colors: { onSurfaceVariant: theme.colors.textSecondary },
                                }}
                                textColor={theme.colors.text}
                                error={!!errors.gender}
                                right={
                                    <TextInput.Icon
                                        icon="menu-down"
                                        onPress={() => setGenderMenuVisible(true)}
                                    />
                                }
                            />
                            <Menu
                                visible={genderMenuVisible}
                                onDismiss={() => setGenderMenuVisible(false)}
                                anchor={<></>} // L'ancre est déjà le champ TextInput
                            >
                                <Menu.Item
                                    onPress={() => {
                                        setFormData((prev) => ({ ...prev, gender: "male" }));
                                        setGenderMenuVisible(false);
                                    }}
                                    title={i18n.t('edit_profile.genders.male')}
                                />
                                <Menu.Item
                                    onPress={() => {
                                        setFormData((prev) => ({ ...prev, gender: "female" }));
                                        setGenderMenuVisible(false);
                                    }}
                                    title={i18n.t('edit_profile.genders.female')}
                                />
                                <Menu.Item
                                    onPress={() => {
                                        setFormData((prev) => ({ ...prev, gender: "other" }));
                                        setGenderMenuVisible(false);
                                    }}
                                    title={i18n.t('edit_profile.genders.other')}
                                />
                            </Menu>
                        </View>
                        <HelperText type="error" visible={!!errors.gender}>
                            {errors.gender}
                        </HelperText>

                        {/* Erreur Générale API */}
                        <HelperText
                            type="error"
                            visible={!!errors.general}
                            style={styles.generalError}
                        >
                            {errors.general}
                        </HelperText>

                        {/* Bouton Sauvegarder */}
                        <CustomButton
                            onPress={handleSave}
                            label={i18n.t('edit_profile.save')}
                            loading={isSubmitting}
                            disabled={isSubmitting || !hasChanges}
                            theme={theme}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// Styles (inchangés, mais ajout de centerContent et errorText)
const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    }, // Style pour chargement/erreur
    errorText: {
        fontSize: 16,
        color: "red",
        textAlign: "center",
        marginBottom: 20,
    }, // Style pour texte d'erreur
    keyboardAvoiding: { flex: 1 },
    scrollViewContent: { flexGrow: 1 },
    container: { flex: 1, paddingHorizontal: 30, paddingVertical: 30 },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    title: { fontSize: 24, fontWeight: "bold", textAlign: "center", flex: 1 },
    input: {
        /* Style */
    },
    dateLabel: { fontSize: 12, marginTop: 10, marginBottom: -4, marginLeft: 12 },
    datePickerButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderRadius: 15,
        paddingVertical: 14,
        paddingHorizontal: 15,
        marginTop: 8,
    },
    datePickerText: { fontSize: 16 },
    saveButton: { marginTop: 30, marginBottom: 20 },
    buttonContent: { paddingVertical: 8 },
    buttonLabel: { fontSize: 16, fontWeight: "bold" },
    generalError: {
        marginTop: 15,
        textAlign: "center",
        fontSize: 14,
        color: "red",
    },
});
