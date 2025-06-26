import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { format, subWeeks, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { i18n } from '@/src/i18n/i18n';
import { useLanguageContext } from '@/src/context/LanguageContext';

interface RawSession {
    date: string; // ISO date string
    duration: number; // in minutes
}

interface WeeklyPerformanceProps {
    sessions: RawSession[];
    theme: any;
    title?: string;
}

const WeeklyPerformance: React.FC<WeeklyPerformanceProps> = ({
    sessions,
    theme,
    title = i18n.t('weekly_performance.title')
}) => {
    const { language } = useLanguageContext();
    const now = new Date();
    // Génère les 8 dernières semaines (de la plus ancienne à la plus récente)
    const weeks = Array.from({ length: 8 }).map((_, i) => {
        const start = startOfWeek(subWeeks(now, 7 - i), { weekStartsOn: 1 });
        const key = start.toISOString().slice(0, 10);
        return { key, start, value: 0 };
    });

    // Additionne la durée des sessions par semaine
    sessions.forEach(({ date, duration }) => {
        const d = new Date(date);
        const weekStart = startOfWeek(d, { weekStartsOn: 1 }).toISOString().slice(0, 10);
        const targetWeek = weeks.find(w => w.key === weekStart);
        if (targetWeek) targetWeek.value += duration;
    });

    const chartData = weeks.map((w, i) => ({
        label: i % 2 === 0 ? format(w.start, "d MMM", { locale: fr }) : '',
        value: w.value,
    }));

    // Par défaut, sélectionne la dernière semaine (la plus récente)
    const [selectedIndex, setSelectedIndex] = useState(chartData.length - 1);

    const screenWidth = Dimensions.get('window').width;
    const horizontalMargin = 18;
    const chartWidth = screenWidth - horizontalMargin * 2;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[styles.selectedValue, { color: theme.colors.primary }]}>
                {weeks[selectedIndex]?.value ?? 0} {i18n.t('statistics.minutes')}
            </Text>

            <BarChart
                data={chartData}
                width={chartWidth}
                height={120} // Hauteur réduite
                barWidth={20}
                barBorderRadius={1}
                frontColor={theme.colors.primary}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor={theme.colors.textSecondary}
                xAxisIndicesColor={theme.colors.text}
                xAxisLabelTextStyle={{ color: theme.colors.text, fontSize: 8 }}
                yAxisTextStyle={{ color: theme.colors.text }}
                noOfSections={4}
                spacing={14}
                maxValue={Math.max(...chartData.map(d => d.value), 5)}
                onPress={(bar: any, index: React.SetStateAction<number>) => {
                    if (typeof index === 'number') setSelectedIndex(index);
                }}
                showGradient={false}
                isAnimated
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 18,
        padding: 16,
        marginBottom: 24,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 14,
        textAlign: 'center',
    },
    selectedValue: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
});

export default WeeklyPerformance;