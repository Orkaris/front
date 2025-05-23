import { v4 as uuidv4 } from 'uuid';

// Types basés sur le schéma de la base de données
export interface User {
  usr_id: string;
  usr_name: string;
  usr_email: string;
  usr_password: string;
  usr_gender: string;
  usr_height: number;
  usr_weight: number;
  usr_birth_date: string;
  usr_profile_type: number;
  usr_is_verified: boolean;
  usr_created_at: string;
}

export interface Sport {
  spo_id: string;
  spo_name: string;
}

export interface Category {
  cat_id: string;
  cat_name: string;
  spo_id: string;
  cat_created_at: string;
}

export interface Exercise {
  exr_id: string;
  exr_name: string;
  exr_description: string;
  exr_created_at: string;
}

export interface ExerciseGoal {
  exg_id: string;
  exg_reps: number;
  exg_sets: number;
  exr_created_at: string;
  exr_id: string;
}

export interface Workout {
  pfr_id: string;
  pfr_name: string;
  usr_id: string;
  pfr_created_at: string;
}

export interface Session {
  ses_id: string;
  ses_name: string;
  usr_id: string;
  wrk_id: string;
  ses_created_at: string;
  ses_duration: string;
}

export interface SessionPerformance {
  spe_id: string;
  ses_id: string;
  spe_feeling: string | null;
  spe_date: string;
}

export interface ExerciseGoalPerformance {
  egp_id: string;
  egp_reps: number;
  egp_sets: number;
  egp_created_at: string;
  exg_id: string;
}

// Données mockées
export const sports: Sport[] = [
  { spo_id: uuidv4(), spo_name: 'Musculation' },
  { spo_id: uuidv4(), spo_name: 'CrossFit' },
  { spo_id: uuidv4(), spo_name: 'Yoga' },
  { spo_id: uuidv4(), spo_name: 'Running' },
];

export const categories: Category[] = [
  { 
    cat_id: uuidv4(), 
    cat_name: 'Pectoraux', 
    spo_id: sports[0].spo_id,
    cat_created_at: new Date().toISOString()
  },
  { 
    cat_id: uuidv4(), 
    cat_name: 'Dos', 
    spo_id: sports[0].spo_id,
    cat_created_at: new Date().toISOString()
  },
  { 
    cat_id: uuidv4(), 
    cat_name: 'Jambes', 
    spo_id: sports[0].spo_id,
    cat_created_at: new Date().toISOString()
  },
  { 
    cat_id: uuidv4(), 
    cat_name: 'HIIT', 
    spo_id: sports[1].spo_id,
    cat_created_at: new Date().toISOString()
  },
];

export const exercises: Exercise[] = [
  {
    exr_id: uuidv4(),
    exr_name: 'Développé Couché',
    exr_description: 'Exercice de musculation pour les pectoraux',
    exr_created_at: new Date().toISOString()
  },
  {
    exr_id: uuidv4(),
    exr_name: 'Tractions',
    exr_description: 'Exercice de musculation pour le dos',
    exr_created_at: new Date().toISOString()
  },
  {
    exr_id: uuidv4(),
    exr_name: 'Squats',
    exr_description: 'Exercice de musculation pour les jambes',
    exr_created_at: new Date().toISOString()
  },
];

export const users: User[] = [
  {
    usr_id: uuidv4(),
    usr_name: 'John Doe',
    usr_email: 'john@example.com',
    usr_password: 'hashed_password',
    usr_gender: 'Male',
    usr_height: 180,
    usr_weight: 80,
    usr_birth_date: '1990-01-01',
    usr_profile_type: 1,
    usr_is_verified: true,
    usr_created_at: new Date().toISOString()
  },
  {
    usr_id: uuidv4(),
    usr_name: 'Jane Smith',
    usr_email: 'jane@example.com',
    usr_password: 'hashed_password',
    usr_gender: 'Female',
    usr_height: 165,
    usr_weight: 60,
    usr_birth_date: '1992-05-15',
    usr_profile_type: 2,
    usr_is_verified: true,
    usr_created_at: new Date().toISOString()
  }
];

export const exerciseGoals: ExerciseGoal[] = [
  {
    exg_id: uuidv4(),
    exg_reps: 12,
    exg_sets: 3,
    exr_created_at: new Date().toISOString(),
    exr_id: exercises[0].exr_id
  },
  {
    exg_id: uuidv4(),
    exg_reps: 10,
    exg_sets: 4,
    exr_created_at: new Date().toISOString(),
    exr_id: exercises[1].exr_id
  }
];

export const workouts: Workout[] = [
  {
    pfr_id: uuidv4(),
    pfr_name: 'Entraînement Pectoraux',
    usr_id: users[0].usr_id,
    pfr_created_at: new Date().toISOString()
  },
  {
    pfr_id: uuidv4(),
    pfr_name: 'Entraînement Dos',
    usr_id: users[0].usr_id,
    pfr_created_at: new Date().toISOString()
  }
];

export const sessions: Session[] = [
  {
    ses_id: uuidv4(),
    ses_name: 'Session 1',
    usr_id: users[0].usr_id,
    wrk_id: workouts[0].pfr_id,
    ses_created_at: new Date().toISOString(),
    ses_duration: '01:00:00'
  },
  {
    ses_id: uuidv4(),
    ses_name: 'Session 2',
    usr_id: users[0].usr_id,
    wrk_id: workouts[1].pfr_id,
    ses_created_at: new Date().toISOString(),
    ses_duration: '01:30:00'
  }
];

export const sessionPerformances: SessionPerformance[] = [
  {
    spe_id: uuidv4(),
    ses_id: sessions[0].ses_id,
    spe_feeling: 'Très bien',
    spe_date: new Date().toISOString()
  },
  {
    spe_id: uuidv4(),
    ses_id: sessions[1].ses_id,
    spe_feeling: 'Fatigué',
    spe_date: new Date().toISOString()
  }
];

export const exerciseGoalPerformances: ExerciseGoalPerformance[] = [
  {
    egp_id: uuidv4(),
    egp_reps: 12,
    egp_sets: 3,
    egp_created_at: new Date().toISOString(),
    exg_id: exerciseGoals[0].exg_id
  },
  {
    egp_id: uuidv4(),
    egp_reps: 10,
    egp_sets: 4,
    egp_created_at: new Date().toISOString(),
    exg_id: exerciseGoals[1].exg_id
  }
];

// Relations entre les entités
export const exerciseCategories = [
  { exe_id: exercises[0].exr_id, cat_id: categories[0].cat_id },
  { exe_id: exercises[1].exr_id, cat_id: categories[1].cat_id },
  { exe_id: exercises[2].exr_id, cat_id: categories[2].cat_id }
];

export const sessionExerciseGoals = [
  { ses_id: sessions[0].ses_id, exg_id: exerciseGoals[0].exg_id },
  { ses_id: sessions[1].ses_id, exg_id: exerciseGoals[1].exg_id }
]; 