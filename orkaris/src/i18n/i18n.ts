import { I18n } from "i18n-js";
import { getLocales } from "expo-localization";
import dayjs from "dayjs";
import "dayjs/locale/fr";

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
        alert: {
            cancel: "Cancel",
            ok: "OK",
            error: "Error",
        },
        settings: {
            application_theme: "Application theme",
            light_theme: "Light",
            dark_theme: "Dark",
            default_theme: "Default",
            application_language: "Application language",
            english: "English",
            french: "French",
            delete_account: "Delete account",
            delete_account_information: "Warning",
            delete_account_confirmation: "Are you sure you want to delete your account? This action cannot be undone.",
        },
        authentication: {
            username: "Username",
            password: "Password",
            email: "Email",
            register_button: "Register",
            connect_button: "Sign in",
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
        profile: {
            user: "User",
            weight: "Weight",
            height: "Height",
            birthdate: "Birthdate",
            undefined: "Undefined",
            invalid_date: "Invalid date",
            sign_out: "Sign out",
            sign_out_confirmation: "Are you sure you want to sign out?",
            sign_out_success: "Sign out successful",
        },
        program: {
            new: "New program",
            name: "Program name",
            create: "Create program",
            no_session: "No program found",
        },
        edit_profile: {
            title: "Edit profile",
            save: "Save",
            name: "Name",
            weight: "Weight (kg)",
            height: "Height (cm)",
            birthdate: "Birthdate",
            gender: "Gender",
            genders : {
                male: "Male",
                female: "Female",
                other : "Other"
            }
        },
        session: {
            new: "New session",
            name: "Session name",
            create: "Create session",
            no_session: "No session found",
        },
        exercise: {
            new: "New exercise",
            name: "Exercise name",
            create: "Create exercise",
            no_session: "No exercise found",
        },
        error: {
            name_required: "Name is required.",
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
        alert: {
            cancel: "Annuler",
            ok: "OK",
            error: "Erreur",
        },
        settings: {
            application_theme: "Thème de l'application",
            light_theme: "Clair",
            dark_theme: "Sombre",
            default_theme: "Par défaut",
            application_language: "Langue de l'application",
            english: "Anglais",
            french: "Français",
            delete_account: "Supprimer le compte",
            delete_account_information: "Attention",
            delete_account_confirmation: "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action ne peut pas être annulée.",
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
        profile: {
            user: "Utilisateur",
            weight: "Poids",
            height: "Taille",
            birthdate: "Naissance",
            undefined: "Non définie",
            invalid_date: "Date invalide",
            sign_out: "Se déconnecter",
            sign_out_confirmation: "Êtes-vous sûr de vouloir vous déconnecter ?",
            sign_out_success: "Déconnexion réussie",
        },
        program: {
            new: "Nouveau programme",
            name: "Nom du programme",
            create: "Créer le programme",
            no_program: "Aucun programme trouvé",
        },
        edit_profile: {
            title: "Modifier le profil",
            save: "Sauvegarder",
            name: "Nom",
            weight: "Poids (kg)",
            height: "Taille (cm)",
            birthdate: "Date de naissance",
            gender: "Genre",
            genders : {
                male: "Homme",
                female: "Femme",
                other: "Autre"
            }
        },
        session: {
            new: "Nouvelle session",
            name: "Nom de la session",
            create: "Créer la session",
            no_session: "Aucune session trouvée",
        },
        exercise: {
            new: "Nouvel exercice",
            name: "Nom de l'exercice",
            create: "Créer l'exercice",
            no_session: "Aucun exercice trouvé",
        },
        error: {
            name_required: "Le nom est requis.",
        }
    },
});

i18n.defaultLocale = deviceLanguage;

i18n.locale = deviceLanguage;
dayjs.locale(deviceLanguage);

export function changeLanguage(lang: string) {
    i18n.locale = lang;
    dayjs.locale(lang);
}