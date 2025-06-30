import React from 'react';
import { Button } from 'react-native-paper';
import { StyleSheet } from 'react-native';

interface CustomButtonProps {
    onPress: () => void;
    label: string;
    loading?: boolean;
    disabled?: boolean;
    theme: any;
    type?: 'primary' | 'secondary' | 'danger';
}

const CustomButton: React.FC<CustomButtonProps> = ({ onPress, label, loading = false, disabled = false, theme, type = 'primary' }) => {
    const getButtonStyle = () => {
        switch (type) {
            case 'secondary':
                return { backgroundColor: theme.colors.surfaceVariant };
            case 'danger':
                return { backgroundColor:  'transparent'};
            default:
                return { backgroundColor: theme.colors.primary };
        }
    };

    const getLabelStyle = () => {
        switch (type) {
            case 'secondary':
                return { color: theme.colors.text };
            case 'danger':
                return { color: theme.colors.error };
            default: 
                return { color: theme.colors.textButton };
        }
    };
    return (
        <Button
            mode="contained"
            onPress={onPress}
            style={[styles.button, getButtonStyle()]}
            contentStyle={styles.buttonContent}
            labelStyle={[styles.buttonLabel, getLabelStyle()]}
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