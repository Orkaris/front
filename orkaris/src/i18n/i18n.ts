import { I18n } from "i18n-js";
import { getLocales } from "expo-localization";

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
        },
        authentication: {
            username: "Username",
            password: "Password",
            email: "Email",
            register_button: "Register",
            connect_button: "Connect",
            already_have_account: "Already have an account?",
            no_account: "Don't have an account?",
            signup: "Sign up",
            signin_to_continue: "Sign in to continue.",
            welcome: "Welcome back,",
            continue: "Continue",
            error: "Error",
            fill_all_fields: "Please fill in all fields.",
            signin_success: "Sign in successful",
            signin_failed: "Sign in failed",
            invalid_credentials: "Invalid email or password.",
            navigate_to_signup: "Navigate to the sign-up page",
            register_prompt: "Please register to continue.",
        },
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
        authentication: {
            username: "Nom d'utilisateur",
            password: "Mot de passe",
            email: "Email",
            register_button: "S'inscrire",
            connect_button: "Se connecter",
            already_have_account: "Vous avez déjà un compte ?",
            no_account: "Vous n'avez pas de compte ?",
            signup: "Inscrivez-vous",
            signin_to_continue: "Connectez-vous pour continuer.",
            welcome: "Bonjour,",
            continue: "Continuer",
            error: "Erreur",
            fill_all_fields: "Veuillez remplir tous les champs.",
            signin_success: "Connexion réussie",
            signin_failed: "Échec de la connexion",
            invalid_credentials: "Email ou mot de passe incorrect.",
            navigate_to_signup: "Naviguer vers la page d'inscription",
            register_prompt: "Veuillez vous inscrire pour continuer.",
        },
    },
});

i18n.defaultLocale = deviceLanguage;

i18n.locale = deviceLanguage;

export function changeLanguage(lang: string) {
    i18n.locale = lang;
}