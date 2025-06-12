import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeContext } from '@/src/context/ThemeContext';
import { i18n } from '@/src/i18n/i18n';
import dayjs from 'dayjs';
import { Ionicons } from '@expo/vector-icons';
import { ExerciseGoalPerformance } from '@/src/model/types';

interface HistoryCardProps {
    id: string;
    sessionName: string;
    date: string;
    exerciseGoalPerformances: ExerciseGoalPerformance[];
    onPress: () => void;
}

export default function HistoryCard({ id, sessionName, date, exerciseGoalPerformances, onPress }: HistoryCardProps) {
    const { theme } = useThemeContext();

    // Calculate total volume (weight × reps × sets)
    const totalVolume = exerciseGoalPerformances.reduce((acc, exercise) => {
        return acc + (exercise.weight * exercise.reps * exercise.sets);
    }, 0);

    // Calculate total sets
    const totalSets = exerciseGoalPerformances.reduce((acc, exercise) => {
        return acc + exercise.sets;
    }, 0);

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={onPress}
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    {sessionName}
                </Text>
                <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
                    {dayjs(date).format('DD/MM/YYYY HH:mm')}
                </Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Ionicons name="barbell-outline" size={20} color={theme.colors.primary} />
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                        {totalVolume}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        {i18n.t('history.total_volume')}
                    </Text>
                </View>

                <View style={styles.statItem}>
                    <Ionicons name="repeat-outline" size={20} color={theme.colors.primary} />
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                        {totalSets}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                        {i18n.t('history.total_sets')}
                    </Text>
                </View>
            </View>

            <View style={styles.exercisesList}>
                {exerciseGoalPerformances.map((exercise, index) => (
                    <Text key={index} style={[styles.exerciseText, { color: theme.colors.textSecondary }]}>
                        • {exercise.exerciseName}: {exercise.sets} {i18n.t('session.sets_label')} × {exercise.reps} {i18n.t('session.reps_label')} × {exercise.weight}kg
                    </Text>
                ))}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    date: {
        fontSize: 14,
        marginTop: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    exercisesList: {
        marginTop: 8,
    },
    exerciseText: {
        fontSize: 14,
        marginBottom: 4,
    },
}); 