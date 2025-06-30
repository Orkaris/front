import React, { createContext, useContext, useState, useEffect } from 'react';
import { i18n, changeLanguage } from '@/src/i18n/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageContextType {
    language: string;
    setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState(i18n.locale);

    useEffect(() => {
        const loadStoredLanguage = async () => {
            const storedLanguage = await AsyncStorage.getItem('USER_LANGUAGE_PREFERENCE');
            if (storedLanguage) {
                setLanguageState(storedLanguage);
                changeLanguage(storedLanguage);
            }
        };
        loadStoredLanguage();
    }, []);

    const setLanguage = async (lang: string) => {
        setLanguageState(lang);
        changeLanguage(lang);
        await AsyncStorage.setItem('USER_LANGUAGE_PREFERENCE', lang);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguageContext = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguageContext must be used within a LanguageProvider');
    }
    return context;
};