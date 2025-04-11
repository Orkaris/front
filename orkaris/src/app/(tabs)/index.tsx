import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, Button } from 'react-native';
import { apiService } from '../../services/api';
import { RootStackParamList, User } from '../../model/types';
import { useThemeContext } from '../../context/ThemeContext';
import Loader from '@/src/components/loader';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
type IndexNavigationProp = NativeStackNavigationProp<RootStackParamList, 'home'>;

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const { theme } = useThemeContext();

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
            {/* <Image
              //source={user.profilePicture ? { uri: user.profilePicture } : require('../assets/images/avatar.png')}
              style={styles.image}
              resizeMode="cover"
            /> */}
            <Text style={{ color: theme.colors.text }}>{user.name}</Text>
          </View>
        </View>
      ) : (
        <Loader />
      )}
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
});
