import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import {
    Headline,
    Paragraph,
    TextInput,
    Button,
    useTheme
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "@react-navigation/native";
import { AuthStackParamList } from "@/src/model/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from '@/src/services/authContext';
import { Alert } from 'react-native';
import { i18n } from '@/src/i18n/i18n';

type NavigationProps = NativeStackNavigationProp<AuthStackParamList, "authentication/signin">;

const SignInScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const theme = useTheme();
    const navigation = useNavigation<NavigationProps>();
    const { signIn } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        try {
            await signIn({ email, password });
            console.log('Sign In Successful');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Email ou mot de passe incorrect.";
            Alert.alert('Échec de la connexion', errorMessage);
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignUp = () => {
        console.log('Navigate to Sign Up Screen');
        navigation.navigate("authentication/register");
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoiding}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.container}>
                        <Headline style={styles.headline}>{i18n.t('hello')},</Headline>
                        <Paragraph style={styles.paragraph}>
                            Connectez vous pour continuer.
                        </Paragraph>

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
                            label="Mot De Passe"
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

                        <Button
                            mode="contained"
                            onPress={handleSignIn}
                            style={[styles.button, { backgroundColor: theme.colors.onSurface }]}
                            contentStyle={styles.buttonContent}
                            labelStyle={[styles.buttonLabel, { color: theme.colors.surface }]}
                            theme={{ roundness: 30 }}
                        >
                            Continuer
                        </Button>

                        <View style={styles.signUpContainer}>
                            <Text style={styles.signUpText}>
                                Vous n'avez pas de compte?{' '}
                            </Text>
                            <Button
                                mode="text"
                                onPress={handleSignUp}
                                uppercase={false}
                                labelStyle={styles.signUpLink}
                                compact
                            >
                                Inscrivez vous
                            </Button>
                        </View>
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
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    signUpText: {
        fontSize: 14,
        color: '#555',
    },
    signUpLink: {
        fontSize: 14,
        fontWeight: 'bold',
        marginHorizontal: -5,
    },
});

export default SignInScreen;