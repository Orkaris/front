import React, { useState } from 'react';
import { View, StyleSheet, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import {
    Headline,
    Paragraph,
    TextInput,
    Button
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackParamList } from "../../model/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from '../../context/AuthContext';
import { Alert } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useThemeContext } from '../../context/ThemeContext';
import { i18n } from '@/src/i18n/i18n';
import { useLayoutEffect } from "react";

type NavigationProps = NativeStackNavigationProp<AuthStackParamList, "authentication/register">;

const SignUpScreen = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const { theme } = useThemeContext();
    const { signUp } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigation = useNavigation<NavigationProps>();
    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: '', // Supprime le titre
        });
    }, [navigation]);

    const [passwordError, setPasswordError] = useState('');
    const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    const handleSignUp = async () => {
        setPasswordError(''); // Reset error
        if (!username || !email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }
        if (!email.includes('@')) {
            Alert.alert('Email invalide');
            return;
        }
        if (!PASSWORD_REGEX.test(password)) {
            setPasswordError('Le mot de passe doit contenir :\n- 8 caractères minimum\n- 1 majuscule\n- 1 chiffre');
            return;
        }

        setIsSubmitting(true);
        try {
            console.log(email, username, password);

            // Assurez-vous que la clé correspond à ce que l'API attend ('name' ou 'username')
            await signUp({ name: username, email, password });
            Alert.alert(
                'Inscription réussie',
                'Votre compte a été créé. Vous pouvez maintenant vous connecter.',
                [{ text: 'OK', onPress: () => navigation.navigate('authentication/signin') }]
            );
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Une erreur s'est produite lors de l'inscription.";
            // Gérer spécifiquement l'erreur "Email already exists" si l'API la fournit
            if (error.response?.data?.error === 'EMAIL_EXISTS' || errorMessage.toLowerCase().includes('exist')) {
                Alert.alert('Erreur', 'Cette adresse email est déjà utilisée.');
            } else {
                Alert.alert('Échec de l\'inscription', errorMessage);
            }
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleSignIn = () => {
        console.log('Navigate to Sign In Screen');
        navigation.navigate("authentication/signin");
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoiding}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.container}>

                        <Headline style={[styles.headline,{color: theme.colors.text}]}>{i18n.t('hello')},</Headline>
                        <Paragraph style={[styles.paragraph,{color: theme.colors.text}]}>
                            {i18n.t('authentication.register_prompt')}
                        </Paragraph>

                        <TextInput
                            label={i18n.t('authentication.username')}
                            value={username}
                            onChangeText={setUsername}
                            mode="outlined"
                            style={[styles.input, { backgroundColor: theme.colors.background}]}
                            autoCapitalize="words"
                            textColor={theme.colors.text}
                            theme={{ roundness: 20, colors: { onSurfaceVariant: theme.colors.textSecondary } }}
                        />

                        <TextInput
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            mode="outlined"
                            style={[styles.input, { backgroundColor: theme.colors.background }]}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            textColor={theme.colors.text}
                            theme={{ roundness: 20, colors: { onSurfaceVariant: theme.colors.textSecondary } }}
                        />

                        <TextInput
                            label={i18n.t('authentication.password')}
                            value={password}
                            onChangeText={setPassword}
                            mode="outlined"
                            textColor={theme.colors.text}
                            secureTextEntry={!passwordVisible}
                            style={[styles.input, { backgroundColor: theme.colors.background }]}
                            theme={{ roundness: 20, colors: { onSurfaceVariant: theme.colors.textSecondary } }}
                            right={
                                <TextInput.Icon
                                    icon={passwordVisible ? "eye-off" : "eye"}
                                    onPress={() => setPasswordVisible(!passwordVisible)}
                                />
                            }
                        />
                        {passwordError ? (
                            <Text style={styles.errorText}>
                                {passwordError}
                            </Text>
                        ) : null}

                        <Button
                            mode="contained"
                            onPress={handleSignUp}
                            style={[styles.button, { backgroundColor: theme.colors.text }]}
                            contentStyle={styles.buttonContent}
                            labelStyle={[styles.buttonLabel, { color: theme.colors.background }]}
                            theme={{ roundness: 30 }}
                            accessibilityLabel="S'inscrire"
                        >
                            {i18n.t('authentication.register_button')}
                        </Button>

                        <View style={styles.signInContainer}>
                            <Text style={[styles.signInText,{color: theme.colors.text}]}>
                                {i18n.t('authentication.already_have_account')}

                            </Text>
                            <Button
                                mode="text"
                                onPress={handleSignIn}
                                uppercase={false}
                                labelStyle={[styles.signInLink, { textAlign: 'center', flexWrap: 'wrap' }]} // Centrer et autoriser le retour à la ligne
                                contentStyle={{ flexShrink: 1 }}
                                compact
                            >
                                {i18n.t('authentication.connect_button')}
                            </Button>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: -10,
        marginBottom: 15,
        marginLeft: 5,
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardAvoiding: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    container: {
        paddingHorizontal: 30,
        paddingVertical: 20,
    },
    headline: {
        fontSize: 34,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#222',
    },
    paragraph: {
        fontSize: 16,
        marginBottom: 30,
        color: '#555',
    },
    input: {
        marginBottom: 20,
    },
    button: {
        marginTop: 15,
    },
    buttonContent: {
        paddingVertical: 8,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    signInContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    signInText: {
        fontSize: 14,
        color: '#555',
    },
    signInLink: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default SignUpScreen;