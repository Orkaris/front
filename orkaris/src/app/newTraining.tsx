import { KeyboardAvoidingView, SafeAreaView, ScrollView, View, Text, Button, StyleSheet, Platform } from "react-native";
import { useThemeContext } from "../context/ThemeContext";

export default function NewTrainingScreen() {
    const { theme } = useThemeContext();

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView style={styles.keyboardAvoiding} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.container}>
                        <Text style={styles.headline}>New Training</Text>
                        <Text style={styles.paragraph}>Create a new training session.</Text>
                        {/* Add your form fields here */}
                        <Button title="Create Training" onPress={() => console.log('Training Created')} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

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
        alignItems: 'center',
        padding: 16,
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
    button: {
        marginTop: 15,
        backgroundColor: '#007BFF',
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    signUpText: {
        fontSize: 16,
        color: '#555',
        marginTop: 20,
    },
    signUpLink: {
        fontSize: 16,
        color: '#007BFF',
        textDecorationLine: 'underline',
    },
});