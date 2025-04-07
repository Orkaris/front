import { useEffect, useState } from 'react';
import { StyleSheet, useColorScheme, Text, View, Image, Button } from 'react-native';
import { apiService } from '../services/api';
import { User } from '../model/types';
import { useThemeContext } from '../theme/ThemeContext';

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const { theme, toggleTheme, isDark } = useThemeContext();

  useEffect(() => {
    const currentUser = async () => {
      const data: User = {
        id: '1d1f-1d1f-1d1f-1d1f',
        username: 'Xx_JohnDoe_xX',
        email: '',
        gender: 'Male',
        height: 180,
        weight: 75,
        birthdate: new Date('1990-01-01'),
        profileType: 1,
        profilePicture: 'https://static.vecteezy.com/system/resources/thumbnails/053/741/746/small/a-colorful-lizard-with-a-blue-and-orange-face-is-staring-at-the-camera-the-lizard-s-face-is-the-main-focus-of-the-image-and-it-is-curious-or-alert-the-bright-colors-of-the-lizard-s-face-photo.jpg',
      };

      if (data) setUser(data);
      const scheme = useColorScheme();
      console.log(scheme);
    }

    currentUser();
  }, []);

  return (
    <View>
      {user ? (
        <View style={{ backgroundColor: theme.colors.background, padding: 20 }}>
          <View style={styles.container}>
            <Image
              source={user.profilePicture ? { uri: user.profilePicture } : require('../../assets/images/avatar.png')}
              style={styles.image}
              resizeMode="cover"
            />
            <Text style={{ color: theme.colors.text }}>{user.username}</Text>
          </View>

          <Text style={{ color: theme.colors.text }}>Current Theme: {isDark ? 'Dark' : 'Light'}</Text>
          <Button title="Toggle Theme" onPress={toggleTheme} />
        </View>
      ) : (
        <Text>Loading user...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 10
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
});
