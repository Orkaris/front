import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme, ThemeType } from './theme';

type ThemeContextType = {
    theme: ThemeType;
    toggleTheme: () => void;
    isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = 'USER_THEME_PREFERENCE';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemScheme === 'dark');

    useEffect(() => {
        const loadStoredTheme = async () => {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            if (saved === 'light') setIsDark(false);
            else if (saved === 'dark') setIsDark(true);
            else setIsDark(systemScheme === 'dark');
        };
        loadStoredTheme();
    }, [systemScheme]);

    const toggleTheme = async () => {
        const newValue = !isDark;
        setIsDark(newValue);
        await AsyncStorage.setItem(STORAGE_KEY, newValue ? 'dark' : 'light');
    };

    const theme = isDark ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider');
    return ctx;
};
