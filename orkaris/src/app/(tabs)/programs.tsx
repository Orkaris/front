import { View, SafeAreaView } from "react-native";
import { useThemeContext } from "@/src/theme/ThemeContext";
import Loader from "@/src/components/loader";

export default function ProgramScreen() {
    const { theme } = useThemeContext();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Loader />
            </View>
        </SafeAreaView>
    );
}