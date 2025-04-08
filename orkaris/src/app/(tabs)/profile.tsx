import { View, Text } from "react-native";
import { useThemeContext } from "@/src/theme/ThemeContext";
import Loader from "@/src/components/loader";
import { useNavigation } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function ProfileScreen() {
    const { theme } = useThemeContext();
    const navigation = useNavigation();

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: theme.colors.text }}>Profile</Text>
                <Ionicons
                    name="settings-sharp"
                    size={24}
                    color={theme.colors.text}
                    onPress={() => navigation.navigate("settings")}
                />
                {/* <Loader /> */}
            </View>
        </View>
    );
}