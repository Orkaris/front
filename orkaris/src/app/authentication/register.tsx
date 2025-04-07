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
import { RootStackParamList

 } from "../../model/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type NavigationProps = NativeStackNavigationProp<RootStackParamList, "authentication/signin">;

const SignUpScreen = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const theme = useTheme();
    //const navigation = useNavigation<NavigationProps>();

    const [passwordError, setPasswordError] = useState('');
    const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    const handleSignUp = () => {
        console.log('Attempting Sign Up with:', { name, email, password });
        if (!email.includes('@')) {
            alert('Email invalide');
            return;
        }
        if (!PASSWORD_REGEX.test(password)) {
            setPasswordError('Le mot de passe doit contenir :\n- 8 caractères minimum\n- 1 majuscule\n- 1 chiffre');
            return;
        }
    };

    const handleSignIn = () => {
        console.log('Navigate to Sign In Screen');
        //navigation.navigate("authentication/signin");
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
                            label="Username"
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
                            S'inscrire
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
                                Connectez vous
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