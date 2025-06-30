import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme, ThemeType } from '../theme/theme';

type ThemeContextType = {
    theme: ThemeType;
    isDark: boolean;
    updateStoredTheme: (newValue: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = 'USER_THEME_PREFERENCE';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemScheme = useColorScheme();
    const [theme, setTheme] = useState<ThemeType>(systemScheme === 'dark' ? darkTheme : lightTheme);

    useEffect(() => {
        const loadStoredTheme = async () => {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            if (saved === 'light') {
                setTheme(lightTheme);
            } else if (saved === 'dark') {
                setTheme(darkTheme);
            } else {
                setTheme(systemScheme === 'dark' ? darkTheme : lightTheme);
            }
        };

        loadStoredTheme();
    }, [systemScheme]);

    const updateStoredTheme = async (newValue: string) => {
        await AsyncStorage.setItem(STORAGE_KEY, newValue);
        if (newValue === 'light') {
            setTheme(lightTheme);
        } else if (newValue === 'dark') {
            setTheme(darkTheme);
        } else {
            setTheme(systemScheme === 'dark' ? darkTheme : lightTheme);
        }
    };

    const isDark = theme.dark;

    return (
        <ThemeContext.Provider value={{ theme, isDark, updateStoredTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider');
    return ctx;
};
