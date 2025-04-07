import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import {
    Headline,
    Paragraph,
    Title,
    Subheading,
    IconButton,
    useTheme,
    Text as PaperText // Renommer pour éviter conflit avec RN Text si besoin
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native'; // Pour la navigation vers l'édition
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Type pour la navigation

import {apiService} from '../services/api'; // Notre client Axios configuré
import { User } from '../model/types'; // Importer le type User
// Supposons une RootStackParamList qui inclut l'écran d'édition
import { RootStackParamList } from '../model/types'; // Assurez-vous que ce type existe et contient 'EditProfile'

// Définir le type de navigation pour cet écran
type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'profile'>; // 'Profile' est le nom de cet écran dans le navigateur

// Fonction utilitaire simple pour formater la date (à améliorer si besoin avec une lib)
const formatDate = (isoString: string | undefined | null): string => {
    if (!isoString) return 'Non définie';
    try {
        const date = new Date(isoString);
        // Options pour formater en "1 juin 2003"
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    } catch (e) {
        console.error("Failed to format date:", e);
        return 'Date invalide';
    }
};

const ProfileScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fonction pour récupérer les données du profil
    const fetchUserProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // === ADAPTER L'ENDPOINT SI NECESSAIRE ===
            const response = await apiService.get<User>('/users/me'); // Endpoint pour récupérer l'utilisateur connecté
            setUser(response);
        } catch (err: any) {
            console.error("Erreur fetchUserProfile:", err.response?.data || err.message);
            setError("Impossible de charger les informations du profil.");
            Alert.alert("Erreur", "Impossible de récupérer les informations du profil. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Charger les données au montage de l'écran
    useEffect(() => {
        // Utiliser focus listener pour recharger si on revient sur l'écran après une modif
        const unsubscribe = navigation.addListener('focus', () => {
            fetchUserProfile();
        });

        // Nettoyer le listener au démontage
        return unsubscribe;
    }, [navigation, fetchUserProfile]);


    const handleEditPress = () => {
        if (!user) {
            console.error('User is null or undefined');
            return;
        }
    
        console.log('Edit button pressed');
        navigation.navigate('editProfile', { userId: user.id });
    };

    // --- Rendu conditionnel ---
    if (isLoading) {
        return (
            <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
                <ActivityIndicator animating={true} size="large" />
            </SafeAreaView>
        );
    }

    if (error || !user) {
        return (
            <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
                <PaperText style={styles.errorText}>{error || "Utilisateur non trouvé."}</PaperText>
                <IconButton icon="refresh" size={30} onPress={fetchUserProfile} />
            </SafeAreaView>
        );
    }

    // --- Rendu principal ---
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <View style={styles.container}>
                {/* Titre */}
                <Headline style={[styles.title, { color: theme.colors.onBackground }]}>
                    Profil
                </Headline>

                {/* Bloc Infos Utilisateur */}
                <View style={styles.userInfoRow}>
                    <View style={styles.avatarAndName}>
                        {/* <Image
                            // === REMPLACER PAR L'URL REELLE DE L'AVATAR SI DISPONIBLE ===
                            source={require('../assets/placeholder-avatar.png')} // Mettre un placeholder local
                            // source={{ uri: user.avatarUrl || 'URL_PLACEHOLDER_PAR_DEFAUT' }} // Si vous avez une URL
                            style={styles.avatar}
                        /> */}
                        <View style={styles.userInfoTextContainer}>
                            <Paragraph style={[styles.greetingText, { color: theme.colors.backdrop }]}>
                                Bonjour
                            </Paragraph>
                            <Title style={[styles.userNameText, { color: theme.colors.onBackground }]}>
                                {user.name || 'Utilisateur'}
                            </Title>
                        </View>
                    </View>
                    <IconButton
                        icon="pencil"
                        style={[styles.editButton, { backgroundColor: theme.colors.onBackground }]}
                        iconColor={theme.colors.background} // Couleur de l'icône
                        size={24}
                        onPress={handleEditPress}
                        accessibilityLabel="Modifier le profil"
                    />
                </View>

                {/* Bloc Statistiques */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Subheading style={[styles.statLabel, { color: theme.colors.backdrop }]}>Poids</Subheading>
                        <Title style={[styles.statValue, { color: theme.colors.onBackground }]}>
                            {user.weight ? `${user.weight} kg` : '-'}
                        </Title>
                    </View>
                    <View style={styles.statItem}>
                        <Subheading style={[styles.statLabel, { color: theme.colors.backdrop }]}>Taille</Subheading>
                        <Title style={[styles.statValue, { color: theme.colors.onBackground }]}>
                            {user.height ? `${user.height} cm` : '-'}
                        </Title>
                    </View>
                    <View style={styles.statItem}>
                        <Subheading style={[styles.statLabel, { color: theme.colors.backdrop }]}>Naissance</Subheading>
                        <Title style={[styles.statValue, { color: theme.colors.onBackground }]}>
                            {formatDate(user.birthDate)}
                        </Title>
                    </View>
                </View>

                {/* Autres sections possibles ici (Amis, Paramètres, Déconnexion, etc.) */}
                {/* Exemple: Bouton Déconnexion (peut-être mieux dans un écran Paramètres)
                <Button mode="outlined" onPress={() => {}} style={styles.logoutButton}>
                    Déconnexion
                </Button>
                */}

            </View>
        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20, // Ajouter un peu d'espace en haut
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 30, // Espace sous le titre
    },
    userInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Pour pousser le bouton à droite
        marginBottom: 40, // Espace sous le bloc utilisateur
    },
    avatarAndName: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30, // Pour un cercle parfait
        marginRight: 15,
        backgroundColor: '#eee', // Couleur de fond si l'image ne charge pas
    },
    userInfoTextContainer: {
        // Pas besoin de style spécifique ici pour le moment
    },
    greetingText: {
        fontSize: 14,
        // color: '#666', // Utilisera theme.colors.backdrop
        marginBottom: -4, // Rapprocher du nom
    },
    userNameText: {
        fontSize: 22,
        fontWeight: 'bold',
        // color: '#000', // Utilisera theme.colors.onBackground
    },
    editButton: {
        // backgroundColor: '#333', // Utilisera theme.colors.onBackground
        borderRadius: 20, // Rond
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Espacer les éléments
        paddingHorizontal: 10, // Léger padding pour ne pas coller aux bords si space-between est utilisé
        marginBottom: 30,
    },
    statItem: {
        alignItems: 'center', // Centrer le texte dans chaque item
    },
    statLabel: {
        fontSize: 14,
        // color: '#666', // Utilisera theme.colors.backdrop
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        // color: '#000', // Utilisera theme.colors.onBackground
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    // logoutButton: {
    //     marginTop: 'auto', // Pousse le bouton en bas si le container a flex: 1
    //     marginBottom: 20,
    // }
});

export default ProfileScreen;