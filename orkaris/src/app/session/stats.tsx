import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RadarChart } from 'react-native-gifted-charts';
import { useThemeContext } from '@/src/context/ThemeContext';
import { apiService } from '@/src/services/api';
import { useLocalSearchParams } from 'expo-router';

interface SessionExercise {
    exerciseGoalSessionExercise: {
        exerciseExerciseGoal: {
            id: string;
            name: string;
            description: string; // Assurez-vous que chaque exercice a bien cette propriété
        };
        reps: number;
        sets: number;
    };
}

interface Session {
    id: string;
    name: string;
    sessionExerciseSession: SessionExercise[];
}

export default function SessionStats() {
    const { theme } = useThemeContext();
    const { id: sessionId } = useLocalSearchParams();
    const [muscleData, setMuscleData] = useState<{ [muscle: string]: number }>({});

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const session: Session = await apiService.get(`/Session/${sessionId}/muscles`);
                console.log(session);
                
                // Compter les muscles travaillés
                
                const muscleCount: { [muscle: string]: number } = {};
                
                // Regrouper les exercices par groupe musculaire et sommer la charge totale (reps * sets)
                session.sessionExerciseSession.forEach((ex) => {
                    // On suppose que la description contient le groupe musculaire principal, par exemple "Pectoraux développé couché haltères"
                    // On prend le premier mot comme groupe musculaire, ou 'Autre' si absent
                    const description = ex.exerciseGoalSessionExercise.exerciseExerciseGoal.description || '';
                    const muscle = description.split(" ")[0] || 'Autre';
                    // Calculer la "charge" totale pour ce muscle
                    const charge = ex.exerciseGoalSessionExercise.reps * ex.exerciseGoalSessionExercise.sets;
                    muscleCount[muscle] = (muscleCount[muscle] || 0) + charge;
                });
                
                setMuscleData(muscleCount);
            } catch (e) {
                setMuscleData({});
            }
        };
        if (sessionId) fetchSession();
    }, [sessionId]);

    // Préparer les données pour le RadarChart
    const labels = Object.keys(muscleData);
    const data = labels.map(label => muscleData[label]);
    const maxValue = Math.max(5, ...data);

    return (
        <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={styles.radarContainer}>
                <Text style={[styles.radarTitle, { color: theme.colors.text }]}>Muscles travaillés</Text>
                {labels.length > 0 ? (
                    <RadarChart
                        hideAsterLines={true}
                        hideGrid={false}
                        hideLabels={false}
                        chartSize={320}
                        data={data}
                        labels={labels}
                        maxValue={maxValue}
                        polygonConfig={{
                            stroke: theme.colors.primary,
                            fill: theme.colors.primary,
                            opacity: 0.8,
                            strokeWidth: 1.3,
                            showGradient: false,
                        }}
                        gridConfig={{
                            fill: "white",
                            showGradient: false,
                            stroke: theme.colors.textSecondary,
                            strokeWidth: 0.5,
                            opacity: 0.5,
                        }}
                        labelsPositionOffset={0.5}
                        labelConfig={{
                            fontSize: 12,
                            stroke: theme.colors.textSecondary,
                            textAnchor: 'middle',
                            alignmentBaseline: 'middle',
                            fontWeight: 'bold',
                            fontFamily: 'Arial',
                        }}
                    />
                ) : (
                    <Text style={{ color: theme.colors.textSecondary, marginTop: 20 }}>
                        Pas de données pour cette session.
                    </Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    radarContainer: {
        backgroundColor: '#f0f0f0',
        margin: 24,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    radarTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});