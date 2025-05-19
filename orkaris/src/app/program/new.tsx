import { SafeAreaView, View, StyleSheet, Alert } from "react-native";
import { useThemeContext } from "@/src/context/ThemeContext";
import { TextInput } from "react-native-paper";
import { useState } from "react";
import { apiService } from "@/src/services/api";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import { i18n } from "@/src/i18n/i18n";
import CustomButton from "@/src/components/CustomButton";

export default function NewProgramScreen() {
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
                i18n.t('error.name_required'),
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
                    autoCapitalize="none"
                    theme={{ roundness: 20, colors: { onSurfaceVariant: theme.colors.textSecondary, background: theme.colors.background } }}
                    activeOutlineColor={theme.colors.primary}
                    textColor={theme.colors.text}
                    error={isError}
                />

                <CustomButton
                    onPress={createProgram}
                    label={i18n.t('program.create')}
                    theme={theme}
                />
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