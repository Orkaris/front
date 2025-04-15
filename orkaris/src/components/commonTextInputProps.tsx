import { TextInputProps } from "react-native-paper";

export const createCommonTextInputProps = (theme: any): Partial<TextInputProps> => ({
    mode: "outlined",
    style: [
        { marginBottom: 20, backgroundColor: theme.colors.background, borderColor: theme.colors.textSecondary },
    ],
    textColor: theme.colors.text,
    theme: {
        roundness: 20,
        colors: { onSurfaceVariant: theme.colors.textSecondary },
    },
});