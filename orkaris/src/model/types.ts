export type AuthStackParamList = {
  'authentication/signin': undefined;
  'authentication/register': undefined;
};

export type RootStackParamList = {
  'profile': undefined;
  'editProfile': { userId: string };
  'workout': undefined;
  'workout/:id': { id: string };
  'home': undefined;
  'settings': undefined;
};

// Types de base
type ISOString = string; // Pour représenter les dates au format string ISO 8601
type UniqueId = string; // Pour représenter les identifiants

// Interface pour un Utilisateur
export interface User {
  id: UniqueId;
  name: string;
  email: string;
  gender: string;
  height: number;
  weight: number;
  birthDate: ISOString;
  profileType: number;
  profilePicture: string;
  createdAt: ISOString;
}

// Interface pour un Programme (Workout)
export interface Workout {
  id: UniqueId;
  name: string;
  userId: UniqueId; // Clé étrangère vers User
  createdAt: ISOString;
}

// Interface pour une Séance (Session)
export interface Session {
  id: UniqueId;
  name: string;
  userId: UniqueId;
  workoutId: UniqueId;
  createdAt: ISOString;
}

// Interface pour un Exercice
export interface Exercise {
  id: UniqueId;
  name: string;
  createdAt: ISOString;
}

// Interface pour une Catégorie d'Exercice
export interface Category {
  id: UniqueId;
  name: string;
}

// Interface pour la table de jointure Exercice <-> Catégorie
export interface ExerciseCategory {
  exerciseId: UniqueId;
  categoryId: UniqueId;
}

// Interface pour un Objectif d'Exercice (dans une Séance)
export interface ExerciseGoal {
  id: UniqueId;
  name: string;
  reps: number;
  sets: number;
  createdAt: ISOString;
  exerciseId: UniqueId;
}

// Interface pour la table de jointure Séance <-> Objectif d'Exercice
export interface SessionExercise {
  sessionId: UniqueId;
  exerciseId: UniqueId;
}

// Interface pour la Performance Réalisée sur un Objectif d'Exercice
export interface ExerciseGoalPerformance {
  id: UniqueId;
  reps: number;
  sets: number;
  createdAt: ISOString;
  exerciseGoalId: UniqueId;
}

// Interface pour la Performance Globale d'une Séance
export interface SessionPerformance {
  id: UniqueId;
  sessionId: UniqueId;
  feeling: string;
  date: ISOString;
}

// Interface pour un Sport 
export interface Sport {
    id: UniqueId;
    name: string;
}

// Définir l'interface pour l'état d'authentification
export interface AuthState {
  userToken: string | null;
  isLoading: boolean; // Pour l'écran de chargement initial
  isSignout: boolean; // Utile pour certaines logiques de navigation
  signIn: (data: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (data: { name: string; email: string; password: string }) => Promise<void>;
  userId: string | null; // ID de l'utilisateur connecté
  // Ajoutez ici d'autres états ou actions si nécessaire (ex: User object)
  // user: User | null;
}
