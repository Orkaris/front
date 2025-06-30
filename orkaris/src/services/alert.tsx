import { Alert } from "react-native";
import { i18n } from "@/src/i18n/i18n";

export function showAlert(title: string, message: string, onConfirm: () => void) {
    Alert.alert(
        title,
        message,
        [
            {
                text: i18n.t('alert.cancel'),
                style: 'cancel',
            },
            {
                text: i18n.t('alert.ok'),
                onPress: onConfirm,
            },
        ],
        { cancelable: false },
    );
}