import { Tabs, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { i18n } from '@/src/i18n/i18n';
import { useThemeContext } from '@/src/theme/ThemeContext';
import { useEffect, useState } from 'react';
import Loader from '@/src/components/loader';

export default function TabLayout() {
    const { theme, isDark } = useThemeContext();
    const navigation = useRouter();

    const [forceLoader, setForceLoader] = useState(true);

    // Forcer l'affichage du loader pendant 1 seconde
    useEffect(() => {
        const timer = setTimeout(() => {
            setForceLoader(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const settings = () => {
        return (
            <Ionicons name="settings-sharp" size={24} color={theme.colors.text} onPress={() => navigation.push('/settings')} />
        );
    }

    if (forceLoader) {
        return <Loader />;
    }

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
                title: i18n.t('navigation.home'), headerTitleStyle: { fontSize: 24, fontWeight: 'bold' }, headerShadowVisible: false, headerStyle: { backgroundColor: theme.colors.background }, headerTintColor: theme.colors.text,
                headerRight: settings, headerRightContainerStyle: { paddingRight: 10 },
                tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                    <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
                ),
            }} />
            <Tabs.Screen name="programs" options={{
                title: i18n.t('navigation.programs'), headerTitleStyle: { fontSize: 24, fontWeight: 'bold' }, headerShadowVisible: false, headerStyle: { backgroundColor: theme.colors.background }, headerTintColor: theme.colors.text,
                tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                    <Ionicons name={focused ? 'list' : 'list-outline'} color={color} size={24} />
                ),
            }} />
            <Tabs.Screen name="history" options={{
                title: i18n.t('navigation.history'), headerShown: false,
                tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                    <Ionicons name={focused ? 'time' : 'time-outline'} color={color} size={24} />
                ),
            }} />
            <Tabs.Screen name="profile" options={{
                title: i18n.t('navigation.profile'), headerTitleStyle: { fontSize: 24, fontWeight: 'bold' }, headerShadowVisible: false, headerStyle: { backgroundColor: theme.colors.background }, headerTintColor: theme.colors.text,
                headerRight: settings, headerRightContainerStyle: { paddingRight: 10 },
                tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                    <Ionicons name={focused ? 'person' : 'person-outline'} color={color} size={24} />
                ),
            }} />
        </Tabs>
    );
}