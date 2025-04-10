import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, Button } from 'react-native';
import { User } from '../../model/types';
import { useThemeContext } from '../../theme/ThemeContext';
import Loader from '@/src/components/loader';
import { i18n } from '@/src/i18n/i18n';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const { theme } = useThemeContext();
  const navigation = useRouter();

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

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
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

      <Button title="Nouveau programme" onPress={() => navigation.navigate("/newTraining")} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
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
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
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
