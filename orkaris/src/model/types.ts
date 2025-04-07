export type RootStackParamList = {
  "authentication/register": undefined; // Add other routes as needed
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