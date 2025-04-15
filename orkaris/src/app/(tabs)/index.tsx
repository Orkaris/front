import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, Button, SafeAreaView } from 'react-native';
import { apiService } from '../../services/api';
import { User, Workout } from '../../model/types';
import { useThemeContext } from '../../context/ThemeContext';
import Loader from '@/src/components/loader';
import { i18n } from '@/src/i18n/i18n';
import { useFocusEffect, useRouter } from 'expo-router';
import { useLanguageContext } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';

export default function HomeScreen() {
  const [workouts, setWorkouts] = useState<Workout[] | null>(null);
  const { theme } = useThemeContext();
  const { language } = useLanguageContext();
  const navigation = useRouter();
  const { userId, userToken } = useAuth();

  const fetchWorkouts = useCallback(async () => {
    try {
      const response = await apiService.get<Workout[]>(`/Workout/ByUserId/${userId}`);
      setWorkouts(response);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchWorkouts();
    }, [fetchWorkouts])
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {workouts ? (
        workouts.map((workout) => (
          <Text key={workout.id} style={{ color: theme.colors.text }}>
            {workout.name}
          </Text>
        ))
      ) : (
        <Loader />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 15,
    marginLeft: 5,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  headline: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 30,
    color: '#555',
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 15,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  signInText: {
    fontSize: 14,
    color: '#555',
  },
  signInLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
