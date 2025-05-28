import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Exercise } from '@/src/model/types';

interface ExerciseInput {
    id: string;
    name: string;
    reps?: string;
    sets?: string;
}

interface SessionExercise {
    exerciseId: string;
    exerciseName: string;
    reps: string;
    sets: string;
}

interface ExerciseContextType {
    sessionExercises: SessionExercise[];
    addExercise: (exercise: ExerciseInput) => void;
    removeExercise: (index: number) => void;
    clearExercises: () => void;
    updateExercise: (index: number, field: 'reps' | 'sets', value: string) => void;
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

export function ExerciseProvider({ children }: { children: ReactNode }) {
    const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([]);

    const addExercise = useCallback((exercise: ExerciseInput) => {
        setSessionExercises(prevExercises => {
            const exerciseExists = prevExercises.some(ex => ex.exerciseId === exercise.id);
            if (!exerciseExists) {
                return [...prevExercises, {
                    exerciseId: exercise.id,
                    exerciseName: exercise.name,
                    reps: exercise.reps || '',
                    sets: exercise.sets || ''
                }];
            }
            return prevExercises;
        });
    }, []);

    const removeExercise = useCallback((index: number) => {
        setSessionExercises(prevExercises => {
            const newExercises = [...prevExercises];
            newExercises.splice(index, 1);
            return newExercises;
        });
    }, []);

    const updateExercise = useCallback((index: number, field: 'reps' | 'sets', value: string) => {
        setSessionExercises(prevExercises => {
            const newExercises = [...prevExercises];
            newExercises[index] = {
                ...newExercises[index],
                [field]: value
            };
            return newExercises;
        });
    }, []);

    const clearExercises = useCallback(() => {
        setSessionExercises([]);
    }, []);

    return (
        <ExerciseContext.Provider value={{ sessionExercises, addExercise, removeExercise, clearExercises, updateExercise }}>
            {children}
        </ExerciseContext.Provider>
    );
}

export function useExercise() {
    const context = useContext(ExerciseContext);
    if (context === undefined) {
        throw new Error('useExercise must be used within an ExerciseProvider');
    }
    return context;
} 