import { View, Text } from "react-native";
import { useThemeContext } from "@/src/context/ThemeContext";
import Loader from "@/src/components/loader";

export default function HistoryScreen() {
    const { theme } = useThemeContext();

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>History</Text>

                <Loader />
            </View>
        </View>
    );
}