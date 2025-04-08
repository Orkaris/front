import { I18n } from "i18n-js";
import { getLocales } from "expo-localization";
import { darkTheme } from "../theme/theme";

export const deviceLanguage = getLocales()?.[0]?.languageCode ?? "en";

export const i18n = new I18n({
    en: {
        hello: "Hello",
        navigation: {
            home: "Home",
            programs: "My programs",
            history: "History",
            profile: "Profile",
            back: "Back",
        },
        settings: {
            application_theme: "Application theme",
            light_theme: "Light",
            dark_theme: "Dark",
            default_theme: "Default",
            delete_account: "Delete account",
            delete_account_information: "Warning",
            delete_account_confirmation: "Are you sure you want to delete your account? This action cannot be undone.",
            cancel: "Cancel",
            ok: "OK",
        }
    },
    fr: {
        hello: "Bonjour",
        navigation: {
            home: "Accueil",
            programs: "Mes programmes",
            history: "Historique",
            profile: "Profil",
            back: "Retour",
        },
        settings: {
            application_theme: "Thème de l'application",
            light_theme: "Clair",
            dark_theme: "Sombre",
            default_theme: "Par défaut",
            delete_account: "Supprimer le compte",
            delete_account_information: "Attention",
            delete_account_confirmation: "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action ne peut pas être annulée.",
            cancel: "Annuler",
            ok: "OK",
        },
    },
});

i18n.defaultLocale = deviceLanguage;

i18n.locale = deviceLanguage;

export function changeLanguage(lang: string) {
    i18n.locale = lang;
}