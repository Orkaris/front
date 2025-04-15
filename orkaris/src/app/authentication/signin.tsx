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
    Button
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "@react-navigation/native";
import { AuthStackParamList } from "@/src/model/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from '@/src/context/AuthContext';
import { Alert } from 'react-native';
import { i18n } from '@/src/i18n/i18n';
import { useThemeContext } from '@/src/context/ThemeContext';
import CustomButton from '@/src/components/CustomButton';

type NavigationProps = NativeStackNavigationProp<AuthStackParamList, "authentication/signin">;

export default function SignInScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const { theme } = useThemeContext();
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
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoiding}
            >
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.container}>
                        <Headline style={[styles.headline, { color: theme.colors.text }]}>{i18n.t('hello')},</Headline>
                        <Paragraph style={[styles.paragraph, { color: theme.colors.text }]}>
                            {i18n.t('authentication.signin_to_continue')}
                        </Paragraph>

                        <TextInput
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            mode="outlined"
                            style={[styles.input, { backgroundColor: theme.colors.background }]}
                            keyboardType="email-address"
                            textColor={theme.colors.text}
                            autoCapitalize="none"
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

                        <CustomButton
                            onPress={handleSignIn}
                            label={i18n.t('authentication.connect_button')}
                            loading={isSubmitting}
                            disabled={isSubmitting}
                            theme={theme}
                        />

                        <View style={styles.signUpContainer}>
                            <Text style={[styles.signUpText, { color: theme.colors.text }]}>
                                {i18n.t('authentication.no_account')}
                            </Text>
                            <Button
                                mode="text"
                                onPress={handleSignUp}
                                uppercase={false}
                                labelStyle={styles.signUpLink}
                            >
                                {i18n.t('authentication.signup')}
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
    },
    paragraph: {
        fontSize: 16,
        marginBottom: 30,
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
    signUpContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    signUpText: {
        fontSize: 14,
    },
    signUpLink: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});