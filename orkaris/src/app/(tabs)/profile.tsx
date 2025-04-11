import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    StyleSheet,
    Alert,
    Button,
} from "react-native";
import {
    Headline,
    Paragraph,
    Title,
    Subheading,
    IconButton,
    Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import { i18n } from "@/src/i18n/i18n";

import { apiService } from "@/src/services/api";
import { useAuth } from "@/src/services/authContext";
import { useThemeContext } from "@/src/theme/ThemeContext";

import { RootStackParamList, User } from "@/src/model/types";
import Loader from "@/src/components/loader";
import { showAlert } from "@/src/services/alert";
import { useRouter } from "expo-router";

type ProfileScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "profile"
>;

const formatDate = (isoString: string | undefined | null): string => {
    if (!isoString) return i18n.t('profile.undefined');
    try {
        const date = new Date(isoString);
        const options: Intl.DateTimeFormatOptions = {
            day: "numeric",
            month: "long",
            year: "numeric",
        };
        return date.toLocaleDateString("fr-FR", options);
    } catch (e) {
        console.error("Failed to format date:", e);
        return i18n.t('profile.invalid_date');
    }
};

export default function ProfileScreen() {
    const { theme } = useThemeContext();
    const navigation = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { userId, signOut } = useAuth();

    useEffect(() => {
        console.log("ProfileScreen - Current userId from context:", userId);
    }, [userId]);

    const fetchUserProfile = useCallback(async () => {
        if (!userId) {
            console.error("fetchUserProfile: userId non disponible, arrêt.");
            return;
        }

        if (user) {
            console.log("User data already loaded:", user);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await apiService.get<User>(`/Users/ById/${userId}`);

            if (response) {
                console.log("User data received:", response);
                setUser(response);
            } else {
                throw new Error("Aucune donnée utilisateur reçue de l'API.");
            }
        } catch (err: any) {
            console.error(
                "Erreur fetchUserProfile:",
                err.response?.data || err.message
            );
            setError("Impossible de charger les informations du profil.");
            setUser(null);
            if (err.response?.status === 401 || err.response?.status === 403) {
                Alert.alert("Session expirée", "Veuillez vous reconnecter.", [
                    { text: i18n.t('alert.ok'), onPress: signOut },
                ]);
            } else {
                Alert.alert(
                    i18n.t('alert.error'),
                    "Impossible de récupérer les informations du profil."
                );
            }
        } finally {
            setIsLoading(false);
        }
    }, [userId, apiService, signOut]);

    useFocusEffect(
        useCallback(() => {
            console.log("ProfileScreen focused, fetching profile...");
            fetchUserProfile();
        }, [fetchUserProfile])
    );

    const handleEditPress = () => {
        if (!user) {
            console.error("Tentative d'édition mais user est null");
            Alert.alert(i18n.t('alert.error'), "Les données utilisateur ne sont pas chargées.");
            return;
        }
        console.log("Navigation vers EditProfile avec user:", user);

        navigation.navigate({ pathname: "/editProfile", params: { userId: user.id } });
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
                <Loader />
            </SafeAreaView>
        );
    }

    if (error && !isLoading) {
        return (
            <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
                <Text style={styles.errorText}>{error}</Text>
                <IconButton icon="refresh" size={30} onPress={fetchUserProfile} />
            </SafeAreaView>
        );
    }

    if (!user && !isLoading && !error) {
        return (
            <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
                <Text style={styles.errorText}>
                    Données utilisateur non disponibles.
                </Text>
                <IconButton icon="refresh" size={30} onPress={fetchUserProfile} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
        >
            <View style={styles.container}>
                <View style={styles.userInfoRow}>
                    <View style={styles.avatarAndName}>
                        <View style={styles.userInfoTextContainer}>
                            <Paragraph
                                style={[styles.greetingText, { color: theme.colors.text }]}
                            >
                                {i18n.t('hello')}
                            </Paragraph>
                            <Title
                                style={[
                                    styles.userNameText,
                                    { color: theme.colors.text },
                                ]}
                            >
                                {user?.name || i18n.t('profile.user')}
                            </Title>
                        </View>
                    </View>
                    <IconButton
                        icon="pencil"
                        style={[
                            { backgroundColor: theme.colors.text },
                        ]}
                        iconColor={theme.colors.background}
                        size={24}
                        onPress={() => handleEditPress()}
                        accessibilityLabel="Modifier le profil"
                    />
                    <Ionicons
                        name="settings-sharp"
                        size={24}
                        color={theme.colors.text}
                        onPress={() => navigation.navigate("/settings")}
                    />
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Subheading
                            style={[styles.statLabel, { color: theme.colors.text }]}
                        >
                            {i18n.t('profile.weight')}
                        </Subheading>
                        <Title
                            style={[styles.statValue, { color: theme.colors.text }]}
                        >
                            {user?.weight ? `${user.weight} kg` : "-"}
                        </Title>
                    </View>
                    <View style={styles.statItem}>
                        <Subheading
                            style={[styles.statLabel, { color: theme.colors.text }]}
                        >
                            {i18n.t('profile.height')}
                        </Subheading>
                        <Title
                            style={[styles.statValue, { color: theme.colors.text }]}
                        >
                            {user?.height ? `${user.height} cm` : "-"}
                        </Title>
                    </View>
                    <View style={styles.statItem}>
                        <Subheading
                            style={[styles.statLabel, { color: theme.colors.text }]}
                        >
                            {i18n.t('profile.birthdate')}
                        </Subheading>
                        <Title
                            style={[styles.statValue, { color: theme.colors.text }]}
                        >
                            {formatDate(user?.birthDate)}
                        </Title>
                    </View>
                </View>
            </View>

            <Button
                title={i18n.t('profile.sign_out')}
                onPress={
                    () =>
                        showAlert(i18n.t('profile.sign_out'), i18n.t('profile.sign_out_confirmation'), signOut)
                }
                color='red'
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    centerContent: {
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 30,
    },
    userInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 40,
    },
    avatarAndName: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
        backgroundColor: "#eee",
    },
    userInfoTextContainer: {},
    greetingText: {
        fontSize: 14,
        marginBottom: -4,
    },
    userNameText: {
        fontSize: 22,
        fontWeight: "bold",
    },
    editButton: {
        borderRadius: 20,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        marginBottom: 30,
    },
    statItem: {
        alignItems: "center",
    },
    statLabel: {
        fontSize: 14,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "bold",
    },
    errorText: {
        fontSize: 16,
        color: "red",
        textAlign: "center",
        marginBottom: 10,
    },
});
