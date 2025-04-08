import * as React from 'react';
import { StyleSheet, View, Image } from 'react-native';

export default function Loader() {
    return (
        <View style={styles.container}>
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
