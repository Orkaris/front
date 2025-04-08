import { I18n } from "i18n-js";
import { getLocales } from "expo-localization";

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