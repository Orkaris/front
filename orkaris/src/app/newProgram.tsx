import { KeyboardAvoidingView, SafeAreaView, ScrollView, View, Text, StyleSheet, Platform, Alert } from "react-native";
import { useThemeContext } from "../context/ThemeContext";
import { TextInput, Button } from "react-native-paper";
import { useState } from "react";
import { apiService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";
import { i18n } from "../i18n/i18n";

export default function NewTrainingScreen() {
    const { theme } = useThemeContext();
    const { userId } = useAuth();
    const [name, setName] = useState('');
    const [isError, setIsError] = useState(false);
    const navigation = useRouter();

    const createProgram = async () => {
        setIsError(false);

        if (!name || name.trim() === '') {
            setIsError(true);
            Alert.alert(
                i18n.t('alert.error'),
                i18n.t('program.name_required'),
            );
            return;
        }

        try {
            const response = await apiService.post(`/Workout/${userId}`, { name });
            console.log('Training created:', response);
            navigation.back();
        } catch (error) {
            console.error('Error creating training:', error);
        }
    }


    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <View style={styles.container}>
                <TextInput
                    label={i18n.t('program.name')}
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    mode="outlined"
                    autoCapitalize="words"
                    theme={{ roundness: 20 }}
                    outlineColor={theme.colors.text}
                    activeOutlineColor={theme.colors.text}
                    textColor={theme.colors.text}
                    error={isError}
                />
                <Button onPress={createProgram}>
                    {i18n.t('program.create_program')}
                </Button>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        padding: 20,
        flex: 1,
    },
    input: {
        marginBottom: 20,
        backgroundColor: 'transparent',
    },
});