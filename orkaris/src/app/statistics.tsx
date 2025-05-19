import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { useThemeContext } from '@/src/context/ThemeContext';
import CustomButton from "../components/CustomButton";


const Statistics = () => {
    const { theme } = useThemeContext();

    const data = [
        { value: 15, label: 'Jan' },
        { value: 18, label: 'Feb' },
        { value: 20, label: 'Mar' },
        { value: 20, label: 'Apr' },
        { value: 19, label: 'May' },
    ];

    const goal = 10; // 10 PULL-UPS
    const currentProgress = 7; // current progress: 7 pull-ups
    const progressPercentage = (currentProgress / goal) * 100; // CALCUL DU POURCENTAGE

    // Data for the pie chart
    const pieData = [
        {
            value: currentProgress,
            color: theme.colors.primary,
            text: `${currentProgress}`,
        },
        {
            value: goal - currentProgress,
            color: theme.colors.textSecondary,
            text: `${goal - currentProgress}`,
        },
    ];

    return (
        <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Statistics</Text>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Monthly Performance</Text>
            <BarChart
                data={data}
                barWidth={30}
                barBorderRadius={4}
                frontColor={theme.colors.primary}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor={theme.colors.textSecondary}
            />
            <View style={styles.pieContainer}>
                <Text style={[styles.pieTitle, { color: theme.colors.text }]}>Pull-Up Goal Progress</Text>
                { <PieChart
                    data={pieData}
                    donut
                    backgroundColor={theme.colors.background}
                    radius={80}
                    innerRadius={50}
                    textColor={theme.colors.text}
                    textSize={16}
                    innerCircleBorderColor={theme.colors.textSecondary}
                    showTextBackground
                    centerLabelComponent={() => (
                        <Text style={[styles.centerLabel, { color: theme.colors.text }]}>
                            {`${progressPercentage.toFixed(0)}%`}
                        </Text>
                    )}
                /> }
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    pieContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    pieTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    centerLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Statistics;