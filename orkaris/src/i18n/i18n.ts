import { I18n } from "i18n-js";
import { getLocales } from "expo-localization";
import { darkTheme } from "../theme/theme";

export const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";

export const i18n = new I18n({
    en: {
        hello: "Hello",
        home: "Home",
        programs: "My programs",
        history: "History",
        profile: "Profile",
        defaultTheme: "Default",
        lightTheme: "Light",
        darkTheme: "Dark",
        selectItem: "Select item",
        authentication: {
            username: "Username",
            password: "Password",
            register_button: "Register",
            connect_button: "Connect",
        },
    },
    fr: {
        hello: "Bonjour",
        home: "Accueil",
        programs: "Mes programmes",
        history: "Historique",
        profile: "Profil",
        defaultTheme: "Par défaut",
        lightTheme: "Clair",
        darkTheme: "Sombre",
        selectItem: "Sélectionner un élément",
        authentication: {
            username: "Nom d'utilisateur",
            password: "Mot de passe",
            register_button: "S'inscrire",
            connect_button: "Se connecter",

        },
    },
});

i18n.defaultLocale = deviceLanguage;

i18n.locale = deviceLanguage;

export function changeLanguage(lang: string) {
    i18n.locale = lang;
}