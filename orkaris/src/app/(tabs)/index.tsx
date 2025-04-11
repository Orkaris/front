import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, Button, SafeAreaView } from 'react-native';
import { apiService } from '../../services/api';
import { User, Workout } from '../../model/types';
import { useThemeContext } from '../../context/ThemeContext';
import Loader from '@/src/components/loader';
import { i18n } from '@/src/i18n/i18n';
import { useRouter } from 'expo-router';
import { useLanguageContext } from '@/src/context/LanguageContext';
import { useAuth } from '@/src/context/AuthContext';

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const { theme } = useThemeContext();
  const { language } = useLanguageContext();
  const navigation = useRouter();
  const { userId } = useAuth();

  useEffect(() => {
    const currentUser = async () => {
      const data: User = {
        id: '1d1f-1d1f-1d1f-1d1f',
        name: 'Xx_JohnDoe_xX',
        email: '',
        gender: 'Male',
        height: 180,
        weight: 75,
        birthDate: '1990-01-01',
        profileType: 1,
        createdAt: '2025-01-01',
        profilePicture: 'https://static.vecteezy.com/system/resources/thumbnails/053/741/746/small/a-colorful-lizard-with-a-blue-and-orange-face-is-staring-at-the-camera-the-lizard-s-face-is-the-main-focus-of-the-image-and-it-is-curious-or-alert-the-bright-colors-of-the-lizard-s-face-photo.jpg',
      };

      if (data) setUser(data);
    }

    currentUser();
  }, []);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await apiService.get<Workout[]>(`/Workout/ById/${userId}`);
        setWorkouts(response);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      }
    }

    fetchWorkouts();
  }, [])

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {user ? (
        <View style={{ padding: 20 }}>
          <View style={styles.container}>
            <Image
              source={user.profilePicture ? { uri: user.profilePicture } : require('@/src/assets/images/avatar.png')}
              style={styles.image}
              resizeMode="cover"
            />
            <Text style={{ color: theme.colors.text }}>{user.name}</Text>
          </View>
        </View>
      ) : (
        <Loader />
      )}

      <Button
        title={i18n.t('program.new_program')}
        onPress={() => navigation.navigate("/newTraining")}
      />
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
