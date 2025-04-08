import React, { useState } from 'react';
import { View, StyleSheet, Text as RNText, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import {
    Provider as PaperProvider,
    DefaultTheme,
    Headline,
    Paragraph,
    TextInput,
    Button,
    useTheme
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
//import { useNavigation } from "@react-navigation/native";
import { AuthStackParamList } from "../../model/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from '../../services/authContext';
import { Alert } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useThemeContext } from '../../theme/ThemeContext';
import { i18n } from '@/src/i18n/i18n';

type NavigationProps = NativeStackNavigationProp<AuthStackParamList, "authentication/register">;

const SignUpScreen = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const theme = useTheme();
    const { signUp } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigation = useNavigation<NavigationProps>();
    const { theme: appTheme } = useThemeContext();
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
            const errorMessage = error.response?.data?.message || error.response?.data?.error ||"Une erreur s'est produite lors de l'inscription.";
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
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoiding}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.container}>
                        <Headline style={styles.headline}>Bonjour,</Headline>
                        <Paragraph style={styles.paragraph}>
                            Inscrivez vous pour continuer.
                        </Paragraph>

                        <TextInput
                            label={i18n.t('authentication.username')}
                            value={username}
                            onChangeText={setUsername}
                            mode="outlined"
                            style={styles.input}
                            autoCapitalize="words"
                            theme={{ roundness: 20 }}
                        />

                        <TextInput
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            mode="outlined"
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            theme={{ roundness: 20 }}
                        />

                        <TextInput
                            label={i18n.t('authentication.password')}
                            value={password}
                            onChangeText={setPassword}
                            mode="outlined"
                            secureTextEntry={!passwordVisible}
                            style={styles.input}
                            theme={{ roundness: 20 }}
                            right={
                                <TextInput.Icon
                                    icon={passwordVisible ? "eye-off" : "eye"}
                                    onPress={() => setPasswordVisible(!passwordVisible)}
                                />
                            }
                        />
                        {passwordError ? (
                            <RNText style={styles.errorText}>
                                {passwordError}
                            </RNText>
                        ) : null}

                        <Button
                            mode="contained"
                            onPress={handleSignUp}
                            style={[styles.button, { backgroundColor: theme.colors.onSurface }]}
                            contentStyle={styles.buttonContent}
                            labelStyle={[styles.buttonLabel, { color: theme.colors.surface }]}
                            theme={{ roundness: 30 }}
                            accessibilityLabel="S'inscrire"
                        >
                            {i18n.t('authentication.register_button')}
                        </Button>

                        <View style={styles.signInContainer}>
                            <RNText style={styles.signInText}>
                                Vous avez déjà un compte?{' '}
                            </RNText>
                            <Button
                                mode="text"
                                onPress={handleSignIn}
                                uppercase={false}
                                labelStyle={styles.signInLink}
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
        backgroundColor: '#fff',
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
        flexDirection: 'row',
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
        marginHorizontal: -5,
    },
});

export default SignUpScreen;