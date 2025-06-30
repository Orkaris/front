import * as React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useThemeContext } from '@/src/context/ThemeContext';

export default function Loader() {
    const { theme } = useThemeContext();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Image
                source={require('@/src/assets/images/loading_bg.gif')}
                style={styles.loading}
                resizeMode='cover'
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loading: {
        width: 150,
        height: 150,
    },
});
