import React from 'react';
import { Button } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface CustomButtonProps {
    onPress: () => void;
    label: string;
    loading?: boolean;
    disabled?: boolean;
    theme: any;
}

const CustomButton: React.FC<CustomButtonProps> = ({ onPress, label, loading = false, disabled = false, theme }) => {
    return (
        <Button
            mode="contained"
            onPress={onPress}
            style={[styles.button, { backgroundColor: theme.colors.text }]}
            contentStyle={styles.buttonContent}
            labelStyle={[styles.buttonLabel, { color: theme.colors.background }]}
            theme={{ roundness: 30 }}
            loading={loading}
            disabled={disabled}
        >
            {loading ? '' : label}
        </Button>
    );
};

const styles = StyleSheet.create({
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
});

export default CustomButton;