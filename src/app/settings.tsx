import React, { useState, useEffect } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { i18n } from '../i18n/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeContext } from '../context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { showAlert } from '../services/alert';
import { useLanguageContext } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import CustomButton from '../components/CustomButton';

export default function SettingsScreen() {
    const { deleteAccount } = useAuth();
    const { theme, isDark, updateStoredTheme } = useThemeContext();
    const { language, setLanguage } = useLanguageContext();

    const [themeValue, setThemeValue] = useState<string | null>(null);
    const [isThemeFocus, setIsThemeFocus] = useState(false);

    const [languageValue, setLanguageValue] = useState<string | null>(language);
    const [isLanguageFocus, setIsLanguageFocus] = useState(false);

    const themes = [
        { label: i18n.t('settings.default_theme'), value: 'default', icon: () => <Ionicons name="pencil-outline" size={20} color={theme.colors.text} /> },
        { label: i18n.t('settings.light_theme'), value: 'light', icon: () => <Ionicons name="sunny-outline" size={20} color={theme.colors.text} /> },
        { label: i18n.t('settings.dark_theme'), value: 'dark', icon: () => <Ionicons name="moon-outline" size={20} color={theme.colors.text} /> },
    ];

    const languages = [
        { label: 'Français', value: 'fr', icon: () => <Ionicons name="globe-outline" size={20} color={theme.colors.text} /> },
        { label: 'English', value: 'en', icon: () => <Ionicons name="globe-outline" size={20} color={theme.colors.text} /> },
    ]

    useEffect(() => {
        const getData = async () => {
            try {
                const storedValue = await AsyncStorage.getItem('USER_THEME_PREFERENCE');
                if (storedValue !== null) {
                    setThemeValue(storedValue);
                }
            } catch (e) {
                console.error(e);
            }
        };

        getData();
    }, []);

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <View style={styles.container}>
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ color: theme.colors.text, fontSize: 16, marginBottom: 10 }}>
                        {i18n.t('settings.application_theme')}
                    </Text>
                    <Dropdown
                        style={[styles.dropdown, { backgroundColor: theme.colors.background }]}
                        containerStyle={{ backgroundColor: theme.colors.background }}
                        selectedTextStyle={{ color: theme.colors.text }}
                        activeColor={theme.colors.background}
                        data={themes}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        value={themeValue}
                        onFocus={() => setIsThemeFocus(true)}
                        onBlur={() => setIsThemeFocus(false)}
                        onChange={(item) => {
                            setThemeValue(item.value);
                            setIsThemeFocus(false);
                            updateStoredTheme(item.value);
                        }}
                        renderLeftIcon={() => (
                            <Ionicons
                                style={[styles.icon, { color: theme.colors.text }]}
                                name={isDark ? 'moon-outline' : 'sunny-outline'}
                                size={20}
                            />
                        )}
                        renderItem={(item) => {
                            return (
                                <View style={styles.itemIcon}>
                                    {item.icon()}
                                    <Text style={{ color: theme.colors.text, padding: 5 }}>{item.label}</Text>
                                </View>
                            );
                        }
                        }
                    />
                </View>

                <View style={{ marginBottom: 20 }}>
                    <Text style={{ color: theme.colors.text, fontSize: 16, marginBottom: 10 }}>
                        {i18n.t('settings.application_language')}
                    </Text>
                    <Dropdown
                        style={[styles.dropdown, { backgroundColor: theme.colors.background }]}
                        containerStyle={{ backgroundColor: theme.colors.background }}
                        selectedTextStyle={{ color: theme.colors.text }}
                        activeColor={theme.colors.background}
                        data={languages}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        value={languageValue}
                        onFocus={() => setIsLanguageFocus(true)}
                        onBlur={() => setIsLanguageFocus(false)}
                        onChange={(item) => {
                            setLanguageValue(item.value);
                            setIsLanguageFocus(false);
                            setLanguage(item.value);
                        }}
                        renderLeftIcon={() => (
                            <Ionicons
                                style={[styles.icon, { color: theme.colors.text }]}
                                name={'language-outline'}
                                size={20}
                            />
                        )}
                        renderItem={(item) => {
                            return (
                                <View style={styles.itemIcon}>
                                    {item.icon()}
                                    <Text style={{ color: theme.colors.text, padding: 5 }}>{item.label}</Text>
                                </View>
                            );
                        }
                        }
                    />
                </View>

            </View>

            <View style={styles.buttonContainer}>
                <CustomButton
                    onPress={
                        () =>
                            showAlert(i18n.t('settings.delete_account_information'), i18n.t('settings.delete_account_confirmation'), deleteAccount)
                    }
                    label={i18n.t('settings.delete_account')}
                    theme={theme}
                    loading={false}
                    disabled={false}
                    type="danger"
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({

    buttonContainer: {
        justifyContent: 'flex-end',
        marginBottom: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingTop: 12,
        paddingHorizontal: 20,
    },
    dropdown: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        width: '50%',
    },
    icon: {
        marginRight: 5,
    },
    itemIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5
    },
});