import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { i18n } from '../i18n/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeContext } from '../context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Alert } from 'react-native';

export default function SettingsScreen() {
    const { theme, isDark, updateStoredTheme } = useThemeContext();

    const [value, setValue] = useState<string | null>(null);
    const [isFocus, setIsFocus] = useState(false);

    const themes = [
        { label: i18n.t('settings.default_theme'), value: 'default', icon: () => <Ionicons name="pencil-outline" size={20} color={theme.colors.text} /> },
        { label: i18n.t('settings.light_theme'), value: 'light', icon: () => <Ionicons name="sunny-outline" size={20} color={theme.colors.text} /> },
        { label: i18n.t('settings.dark_theme'), value: 'dark', icon: () => <Ionicons name="moon-outline" size={20} color={theme.colors.text} /> },
    ];

    useEffect(() => {
        const getData = async () => {
            try {
                const storedValue = await AsyncStorage.getItem('USER_THEME_PREFERENCE');
                if (storedValue !== null) {
                    setValue(storedValue);
                }
            } catch (e) {
                console.log(e);
            }
        };

        getData();
    }, []);

    const showAlert = () => {
        Alert.alert(
            i18n.t('settings.delete_account_information'),
            i18n.t('settings.delete_account_confirmation'),
            [
                {
                    text: i18n.t('alert.cancel'),
                    style: 'cancel',
                    onPress: () => console.log('Cancel Pressed'),
                },
                {
                    text: i18n.t('alert.ok'),
                    onPress: () => console.log('OK Pressed')
                },
            ],
            { cancelable: false },
        );
    }

    return (
        <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
            <View style={styles.container}>
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
                    value={value}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                        setValue(item.value);
                        setIsFocus(false);
                        updateStoredTheme(item.value);
                    }}
                    renderLeftIcon={() => (
                        <Ionicons
                            style={[styles.icon, { color: theme.colors.text }]}
                            color={isFocus ? 'blue' : 'black'}
                            name={isDark ? 'moon-outline' : 'sunny-outline'}
                            size={20}
                        />
                    )}
                    renderItem={(item) => {
                        return (
                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5 }}>
                                {item.icon()}
                                <Text style={{ color: theme.colors.text, padding: 5 }}>{item.label}</Text>
                            </View>
                        );
                    }
                    }
                />

                <Button
                    title={i18n.t('settings.delete_account')}
                    onPress={showAlert}
                    color='red'
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    container: {
        padding: 16,
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
});