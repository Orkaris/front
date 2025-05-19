import React, { useState, useCallback } from "react";
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from "react-native";
import {
    TextInput,
    IconButton,
    HelperText,
    Text,
    Button,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import dayjs from "dayjs";
import { Dropdown } from 'react-native-element-dropdown';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useThemeContext } from "@/src/context/ThemeContext";
import { apiService } from "../../services/api";
import { User } from "../../model/types";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import Loader from "../../components/loader";
import { i18n } from "../../i18n/i18n";
import { createCommonTextInputProps } from "../../components/commonTextInputProps";
import CustomButton from "../../components/CustomButton";

const formatDateForDisplay = (date: Date | null | undefined): string => {
    if (!date) return "";
    try {
        const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
        return date.toLocaleDateString("fr-FR", options);
    } catch (e) { return "Date invalide"; }
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
    general?: string;
    gender?: string;
}

export default function EditProfileScreen() {
    const { theme } = useThemeContext();
    const navigation = useRouter();
    const { userId, signOut } = useAuth();

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<EditProfileFormData>({ name: "", weight: "", height: "", birthDate: null, gender: "" });
    const [initialData, setInitialData] = useState<EditProfileFormData>({ name: "", weight: "", height: "", birthDate: null, gender: "" });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isGenderFocus, setIsGenderFocus] = useState(false);

    const genderData = [
        { label: i18n.t('edit_profile.genders.male'), value: 'male', icon: () => <Ionicons name="male-outline" size={20} color={theme.colors.text} /> },
        { label: i18n.t('edit_profile.genders.female'), value: 'female', icon: () => <Ionicons name="female-outline" size={20} color={theme.colors.text} /> },
        { label: i18n.t('edit_profile.genders.other'), value: 'other', icon: () => <Ionicons name="male-female-outline" size={20} color={theme.colors.text} /> },
    ];

    const fetchDataForEdit = useCallback(async () => {
        if (!userId) { setError("Impossible d'identifier l'utilisateur."); setIsLoading(false); return; } setIsLoading(true); setError(null);
        try {
            const fetchedUser = await apiService.get<User>(`/Users/ById/${userId}`); if (!fetchedUser) throw new Error("Aucune donnée utilisateur reçue.");
            const initialFormState = { name: fetchedUser.name || "", weight: fetchedUser.weight?.toString() || "", height: fetchedUser.height?.toString() || "", birthDate: fetchedUser.birthDate ? new Date(fetchedUser.birthDate) : null, gender: fetchedUser.gender || "" };
            setFormData(initialFormState); setInitialData(initialFormState);
        } catch (err: any) { console.error("Erreur fetchDataForEdit:", err.response?.data || err.message); setError("Impossible de charger les informations."); setUser(null); setFormData({ name: "", weight: "", height: "", birthDate: null, gender: "" }); setInitialData({ name: "", weight: "", height: "", birthDate: null, gender: "" }); if (err.response?.status === 401 || err.response?.status === 403) { Alert.alert("Session expirée", "Veuillez vous reconnecter.", [{ text: "OK", onPress: signOut }]); } else { Alert.alert("Erreur", "Impossible de charger les informations."); } } finally { setIsLoading(false); }
    }, [userId, apiService, signOut]);
    useFocusEffect(useCallback(() => { fetchDataForEdit(); }, [fetchDataForEdit]));
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);
    const handleInputChange = (name: keyof EditProfileFormData, value: string | Date | null) => { setFormData((prev) => ({ ...prev, [name]: value })); if (errors[name]) { setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined })); } };
    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => { const currentDate = selectedDate || formData.birthDate; setShowDatePicker(Platform.OS === 'ios'); if (event.type === 'set' && selectedDate) { handleInputChange('birthDate', currentDate); } };
    const validateForm = (): boolean => { const newErrors: FormErrors = {}; if (!formData.name.trim()) newErrors.name = "Le nom est requis."; const weightNum = parseFloat(formData.weight); if (formData.weight && (isNaN(weightNum) || weightNum <= 0)) newErrors.weight = "Poids invalide."; const heightNum = parseFloat(formData.height); if (formData.height && (isNaN(heightNum) || heightNum <= 0)) newErrors.height = "Taille invalide."; if (!formData.birthDate) newErrors.birthDate = "Date de naissance requise."; if (!formData.gender) newErrors.gender = "Le genre est requis."; setErrors(newErrors); return Object.keys(newErrors).length === 0; };
    const handleSave = async () => { if (!validateForm()) { return; } setIsSubmitting(true); setErrors({}); const payload = { name: formData.name.trim(), weight: formData.weight ? parseFloat(formData.weight) : null, height: formData.height ? parseFloat(formData.height) : null, birthDate: formData.birthDate ? dayjs(formData.birthDate).format("YYYY-MM-DD") : null, gender: formData.gender }; try { const response = await apiService.put<User>(`/users/${userId}`, payload); Alert.alert("Succès", "Votre profil a été mis à jour."); navigation.back(); } catch (err: any) { const apiError = err.response?.data?.message || err.response?.data?.error || "Erreur réseau/serveur."; setErrors(prev => ({ ...prev, general: apiError })); Alert.alert("Échec", apiError); } finally { setIsSubmitting(false); } };

    const renderGenderLabel = () => {
        if (formData.gender || isGenderFocus) {
            return (
                <Text style={[
                    styles.label,
                    {
                        color: isGenderFocus ? theme.colors.error : theme.colors.textSecondary,
                        backgroundColor: theme.colors.background
                    }
                ]}>
                    {i18n.t('edit_profile.gender')}
                </Text>
            );
        }
        return null;
    };

    if (isLoading) { return <SafeAreaView style={[styles.safeArea, styles.centerContent]}><Loader /></SafeAreaView>; }
    if (error) { return <SafeAreaView style={[styles.safeArea, styles.centerContent]}><Text style={styles.errorText}>{error}</Text><Button mode="outlined" onPress={fetchDataForEdit} icon="refresh">Réessayer</Button><Button mode="text" onPress={() => navigation.back()} style={{ marginTop: 10 }}>Retour</Button></SafeAreaView>; }

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoiding} keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.container}>
                        <TextInput label={i18n.t('edit_profile.name')} value={formData.name} onChangeText={(text) => handleInputChange("name", text)} {...createCommonTextInputProps(theme)} error={!!errors.name} disabled={isSubmitting} />
                        <HelperText type="error" visible={!!errors.name}>{errors.name}</HelperText>

                        <TextInput label={i18n.t('edit_profile.weight')} value={formData.weight} onChangeText={(text) => handleInputChange("weight", text.replace(/[^0-9.]/g, ""))} {...createCommonTextInputProps(theme)} keyboardType="numeric" error={!!errors.weight} disabled={isSubmitting} />
                        <HelperText type="error" visible={!!errors.weight}>{errors.weight}</HelperText>

                        <TextInput label={i18n.t('edit_profile.height')} value={formData.height} onChangeText={(text) => handleInputChange("height", text.replace(/[^0-9]/g, ""))} {...createCommonTextInputProps(theme)} keyboardType="numeric" error={!!errors.height} disabled={isSubmitting} />
                        <HelperText type="error" visible={!!errors.height}>{errors.height}</HelperText>

                        <TextInput label={i18n.t('edit_profile.birthdate')} value={formatDateForDisplay(formData.birthDate)} editable={false} mode="outlined" {...createCommonTextInputProps(theme)} error={!!errors.birthDate} disabled={isSubmitting} right={<TextInput.Icon icon="calendar" onPress={() => !isSubmitting && setShowDatePicker(true)} forceTextInputFocus={false} disabled={isSubmitting} />} />
                        <HelperText type="error" visible={!!errors.birthDate}>{errors.birthDate}</HelperText>
                        {showDatePicker && (<DateTimePicker value={formData.birthDate || new Date()} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onDateChange} maximumDate={new Date()} />)}

                        <View style={styles.dropdownContainer}>
                            {renderGenderLabel()}
                            <Dropdown
                                style={[
                                    styles.dropdown,
                                    { backgroundColor: theme.colors.background },
                                    { borderColor: errors.gender ? theme.colors.error : (isGenderFocus ? theme.colors.error : theme.colors.textSecondary) }
                                ]}
                                placeholderStyle={[styles.placeholderStyle, { color: theme.colors.textSecondary }]}
                                selectedTextStyle={[styles.selectedTextStyle, { color: theme.colors.text }]}
                                inputSearchStyle={[styles.inputSearchStyle, { color: theme.colors.text }]}
                                iconStyle={styles.iconStyle}
                                containerStyle={[styles.dropdownListContainer, { backgroundColor: theme.colors.background }]}
                                activeColor={theme.colors.surfaceVariant}
                                data={genderData}
                                labelField="label"
                                valueField="value"
                                value={formData.gender}
                                onFocus={() => setIsGenderFocus(true)}
                                onBlur={() => setIsGenderFocus(false)}
                                onChange={item => {
                                    handleInputChange('gender', item.value);
                                    setIsGenderFocus(false);
                                }}
                                renderLeftIcon={() => (
                                    <Ionicons style={[styles.icon, { color: theme.colors.text }]} name={formData.gender === 'male' ? 'male-outline' : formData.gender === 'female' ? 'female-outline' : formData.gender === 'other' ? 'male-female-outline' : 'help-circle-outline'} size={20} />
                                )}
                                renderItem={(item, isSelected) => (
                                    <View style={[styles.item, { backgroundColor: isSelected ? theme.colors.surfaceVariant : theme.colors.background }]}>
                                        {item.icon()}
                                        <Text style={[styles.textItem, { color: theme.colors.text }]}>{item.label}</Text>
                                    </View>
                                )}
                                disable={isSubmitting}
                            />
                        </View>
                        <HelperText type="error" visible={!!errors.gender}>{errors.gender}</HelperText>

                        <HelperText type="error" visible={!!errors.general} style={styles.generalError}>{errors.general}</HelperText>

                        <CustomButton onPress={handleSave} label={i18n.t('edit_profile.save')} loading={isSubmitting} disabled={isSubmitting || !hasChanges} theme={theme} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    centerContent: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    errorText: { fontSize: 16, color: "red", textAlign: "center", marginBottom: 20 },
    keyboardAvoiding: { flex: 1 },
    scrollViewContent: { flexGrow: 1 },
    container: { flex: 1, paddingHorizontal: 30, paddingVertical: 30 },
    generalError: { marginTop: 15, textAlign: "center", fontSize: 14, color: "red" },
    dropdownContainer: {
        marginTop: 8,
    },
    dropdown: {
        height: 56,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 14,
    },
    icon: {
        marginRight: 10,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
    dropdownListContainer: {
        borderRadius: 8,
    },
    item: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
    },
    textItem: {
        flex: 1,
        fontSize: 16,
        marginLeft: 10,
    },
    label: {
        position: 'absolute',
        left: 22,
        top: -8,
        zIndex: 999,
        paddingHorizontal: 6,
        fontSize: 12,
    },
});