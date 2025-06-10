import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ViewToken } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export interface MotivationalStat {
    value?: string | number;
    message: string;
    icon?: string; // emoji ou icône
}

interface MotivationalStatsProps {
    stats: MotivationalStat[];
    title?: string;
    theme: any;
}

const MotivationalStats: React.FC<MotivationalStatsProps> = ({ stats, title = "Let's go baby !", theme }) => {
    const listRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (stats.length > 1) {
            const randomIndex = Math.floor(Math.random() * stats.length);
            setTimeout(() => {
                listRef.current?.scrollToIndex({ index: randomIndex, animated: false });
                setCurrentIndex(randomIndex);
            }, 100);
        }
    }, [stats]);

    const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index ?? 0);
        }
    });

    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

    return (
        <View style={[styles.container, {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.primary + '55',
            shadowColor: theme.colors.primary + '66'
        }]}>
            <Text style={[styles.title, { color: theme.colors.primary }]}>{title}</Text>

            <FlatList
                getItemLayout={(_, index) => ({
                    length: 276, // largeur de chaque carte (statBlock width + margins)
                    offset: 276 * index,
                    index,
                })}
                ref={listRef}
                data={stats}
                keyExtractor={(_, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 8 }}
                renderItem={({ item }) => (
                    <Animated.View
                        entering={FadeInUp.duration(400)}
                        style={[styles.statBlock, { backgroundColor: theme.colors.card }]}
                    >
                        <Text style={[styles.icon, { color: theme.colors.primary }]}>{item.icon}</Text>
                        <Text style={[styles.value, { color: theme.colors.primary }]}>{item.value}</Text>
                        <Text style={[styles.message, { color: theme.colors.text }]}>{item.message}</Text>
                    </Animated.View>
                )}
                onViewableItemsChanged={onViewRef.current}
                viewabilityConfig={viewConfigRef.current}
            />

            {/* Pagination Dots */}
            <View style={styles.pagination}>
                {stats.map((_, idx) => (
                    <View
                        key={idx}
                        style={[
                            styles.dot,
                            {
                                backgroundColor: idx === currentIndex
                                    ? theme.colors.primary
                                    : theme.colors.primary + '33'
                            }
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 20,
        margin: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 4,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
    },
    statBlock: {
        width: 260,
        marginHorizontal: 8,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 32,
        marginBottom: 6,
    },
    value: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        opacity: 0.85,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 4,
    },
});

export default MotivationalStats;
