import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { BarChart, PieChart, RadarChart } from 'react-native-gifted-charts';
import { useThemeContext } from '@/src/context/ThemeContext';
import CustomButton from "../components/CustomButton";


const Statistics = () => {
    const { theme } = useThemeContext();

    const data = [
        { value: 15, label: 'Jan' },
        { value: 18, label: 'Feb' },
        { value: 20, label: 'Mar' },
        { value: 22, label: 'Apr' },
        { value: 26, label: 'May' },
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

    type PolygonConfig = {
        stroke?: 'red';
        strokeWidth?: number;
        strokeDashArray?: number[];
        fill?: string;
        gradientColor?: string;
        showGradient?: boolean;
        opacity?: number;
        gradientOpacity?: number;
        showDataValuesAsLabels?: boolean;
        isAnimated?: boolean;
        animationDuration?: number;
      };

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
                xAxisIndicesColor={theme.colors.text}
                xAxisLabelTextStyle={{ color: theme.colors.text }}
                yAxisTextStyle={{ color: theme.colors.text }}
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
            <View style={styles.sessionInfoContainer}>
                <Text style={[styles.sessionInfoTitle, { color: theme.colors.text, fontSize: 20 }]}>Infos de sessions</Text>
                <View style={styles.sessionInfoColumn}>
                    <View style={[styles.sessionInfoBubble, { alignSelf: 'flex-start' }]}>  
                        <Text style={[styles.sessionInfoLabel, { color: theme.colors.textSecondary, fontSize: 16 }]}>Temps moyen des sessions</Text>
                        <Text style={[styles.sessionInfoValue, { color: theme.colors.primary, fontSize: 22 }]}>45 min</Text>
                    </View>
                    <View style={[styles.sessionInfoBubble, { alignSelf: 'flex-end' }]}>  
                        <Text style={[styles.sessionInfoLabel, { color: theme.colors.textSecondary, fontSize: 16 }]}>Temps moyen de pause</Text>
                        <Text style={[styles.sessionInfoValue, { color: theme.colors.primary, fontSize: 22 }]}>2 min</Text>
                    </View>
                    <View style={[styles.sessionInfoBubble, { alignSelf: 'flex-start' }]}>  
                        <Text style={[styles.sessionInfoLabel, { color: theme.colors.textSecondary, fontSize: 16 }]}>Temps moyen d'exercice</Text>
                        <Text style={[styles.sessionInfoValue, { color: theme.colors.primary, fontSize: 22 }]}>1 min</Text>
                    </View>
                </View>
            </View>
            <View style={[styles.radarContainer, { paddingRight: 0 }]}>
                <Text style={[styles.radarTitle, { color: theme.colors.textSecondary }]}>Muscles travaillés</Text>
                <RadarChart
                    hideAsterLines={true}
                    hideGrid={false} 
                    hideLabels={false}
                    chartSize={250}

                    data={[8, 5, 6, 3, 9]} // Array of numbers
                    labels={['Pectoraux', 'Biceps', 'Triceps', 'Jambes', 'Dos']} // Labels for each value
                    maxValue={10}
                    polygonConfig={{
                        stroke: theme.colors.primary,
                        fill: theme.colors.primary,
                        opacity: 0.8,
                        strokeWidth: 1.3,
                        showGradient: false,
                        gradientOpacity: 0,
                        showDataValuesAsLabels: true,
                        isAnimated: false,
                        animationDuration: 5,
                    }}
                    gridConfig={{
                        fill: "white",
                        showGradient: false,
                        stroke: theme.colors.textSecondary,
                        strokeWidth: 0.5,
                        opacity: 0.5,
                        gradientOpacity: 0,
                    }}
                    labelsPositionOffset={0.5}
                    labelConfig={{
                        fontSize: 8,
                        stroke: theme.colors.textSecondary,
                        textAnchor: 'middle',
                        alignmentBaseline: 'middle',
                        fontWeight: 'bold',
                        fontFamily: 'Arial',
                    }}
                    dataLabelsConfig={{
                        fontSize: 0,
                        stroke: theme.colors.text,
                        textAnchor: 'middle',
                        alignmentBaseline: 'middle',
                        fontWeight: 'bold',
                        fontFamily: 'Arial',
                    }}

                    
                />
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
    sessionInfoContainer: {
        marginTop: 30,
        padding: 16,
        borderRadius: 8,
        width: '100%',
    },
    sessionInfoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    sessionInfoColumn: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
    },
    sessionInfoBubble: {
        backgroundColor: '#f0f0f0',
        padding: 16,
        borderRadius: 20,
        flex: 1,
        marginVertical: 8,
        alignItems: 'center',
    },
    sessionInfoLabel: {
        fontSize: 14,
        color: '#666',
    },
    sessionInfoValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
    },
    radarContainer: {
        overflow: 'visible',
        backgroundColor: '#f0f0f0',
        margin: 50,
        outline: 'none',
        borderWidth: 0,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.25,
        width: '100%',
        height: 300,
        justifyContent: 'center',   
        alignItems: 'center',
    },
    radarTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});

export default Statistics;