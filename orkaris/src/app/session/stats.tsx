import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RadarChart } from 'react-native-gifted-charts';
import { useThemeContext } from '@/src/context/ThemeContext';
import { apiService } from '@/src/services/api';
import { useLocalSearchParams } from 'expo-router';
import { i18n } from '@/src/i18n/i18n';

interface MuscleStat {
    nomMuscle: string;
    valeur: number;
    nbRep?: number;
    nbSet?: number;
}

export default function SessionStats() {
    const { theme } = useThemeContext();
    const { id: sessionId } = useLocalSearchParams();
    const [muscleData, setMuscleData] = useState<{ [muscle: string]: number }>({});

    useEffect(() => {
        const fetchMuscleStats = async () => {
            try {
                const stats: MuscleStat[] = await apiService.get(`/Session/${sessionId}/muscles`);
                const muscleCount: { [muscle: string]: number } = {};
                stats.forEach(stat => {
                    muscleCount[stat.nomMuscle] = stat.valeur;
                });
                setMuscleData(muscleCount);
            } catch (e) {
                setMuscleData({});
            }
        };
        if (sessionId) fetchMuscleStats();
    }, [sessionId]);

    const labels = Object.keys(muscleData);
    const data = labels.map(label => muscleData[label]);
    const maxValue = Math.max(5, ...data);

    return (
        <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={styles.radarContainer}>
                <Text style={[styles.radarTitle, { color: theme.colors.text }]}>{i18n.t('statistics.muscles_worked')}</Text>
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
                        {i18n.t('statistics.no_data')}
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