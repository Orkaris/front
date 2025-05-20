import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, Button, SafeAreaView } from 'react-native';
import { useThemeContext } from '@/src/context/ThemeContext';
import Loader from '@/src/components/loader';

export default function HomeScreen() {
  const { theme } = useThemeContext();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <Loader />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
