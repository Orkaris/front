import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { i18n } from '@/src/i18n/i18n';
import { useThemeContext } from '@/src/theme/ThemeContext';

export default function TabLayout() {
    const { theme, isDark } = useThemeContext();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: isDark ? '#ff0000' : '#0000ff',
                tabBarInactiveTintColor: theme.colors.text,
                tabBarStyle: {
                    backgroundColor: theme.colors.background,
                    borderTopColor: theme.colors.text,
                },
            }}
        >
            <Tabs.Screen name="index" options={{
                title: i18n.t('navigation.home'), headerShown: false, tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                    <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
                ),
            }} />
            <Tabs.Screen name="programs" options={{
                title: i18n.t('navigation.programs'), headerShown: false, tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                    <Ionicons name={focused ? 'list' : 'list-outline'} color={color} size={24} />
                ),
            }} />
            <Tabs.Screen name="history" options={{
                title: i18n.t('navigation.history'), headerShown: false, tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                    <Ionicons name={focused ? 'time' : 'time-outline'} color={color} size={24} />
                ),
            }} />
            <Tabs.Screen name="profile" options={{
                title: i18n.t('navigation.profile'), headerShown: false, tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                    <Ionicons name={focused ? 'person' : 'person-outline'} color={color} size={24} />
                ),
            }} />
        </Tabs>
    );
}