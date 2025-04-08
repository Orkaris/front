import { View, Text } from "react-native";
import { useThemeContext } from "@/src/theme/ThemeContext";
import Loader from "@/src/components/loader";

export default function ProgramScreen() {
    const { theme } = useThemeContext();

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>My programs</Text>

                <Loader />
            </View>
        </View>
    );
}