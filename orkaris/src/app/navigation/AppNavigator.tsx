// Dans navigation/AppNavigator.tsx (ou équivalent)
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../../services/authContext'; // Adaptez le chemin

// Écrans d'Authentification
import SignInScreen from '../authentication/signin'; // Adaptez le chemin
import SignUpScreen from '../authentication/register'; // Adaptez le chemin

import { AuthStackParamList } from "../../model/types";
// Écrans Principaux (post-connexion)
import HomeScreen from '../(tabs)/index'; // Exemple
//import ProfileScreen from '../screens/app/ProfileScreen'; // Exemple
// ... importez vos autres écrans principaux

//import SplashScreen from '../screens/SplashScreen'; // Un écran de chargement simple

// Définissez vos types de paramètres de route si ce n'est pas déjà fait


export type AppTabsParamList = { // Exemple avec des onglets
    Home: undefined;
    Workouts: undefined; // Remplacez par vos vrais noms d'écrans/onglets
    Stats: undefined;
    Profile: undefined;
};
// Ou pour une Stack principale:
export type AppStackParamList = {
    // ... vos écrans principaux ...
     Home: undefined;
     WorkoutDetails: { workoutId: string };
     Profile: undefined;
     Settings: undefined;
     // ...
};


const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>(); // Ou Tab Navigator
// const AppTabs = createBottomTabNavigator<AppTabsParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="authentication/signin" component={SignInScreen} />
    <AuthStack.Screen name="authentication/register" component={SignUpScreen} />
  </AuthStack.Navigator>
);

const MainAppNavigator = () => (
  // Utilisez ici votre navigateur principal (Stack ou Tabs)
  <AppStack.Navigator>
    <AppStack.Screen name="Home" component={HomeScreen} />
    {/* <AppStack.Screen name="Profile" component={ProfileScreen} /> */}
    {/* Ajoutez vos autres écrans/onglets ici */}
  </AppStack.Navigator>
  /* Exemple avec Tabs:
  <AppTabs.Navigator>
      <AppTabs.Screen name="Home" component={HomeScreen} />
      <AppTabs.Screen name="Workouts" component={WorkoutsScreen} />
      <AppTabs.Screen name="Stats" component={StatsScreen} />
      <AppTabs.Screen name="Profile" component={ProfileScreen} />
  </AppTabs.Navigator>
  */
);

const AppNavigator = () => {
  const { userToken, isLoading } = useAuth();

  if (isLoading) {
    // Pendant que l'on vérifie le token au démarrage
    // return <SplashScreen />;
  }

  return userToken ? <MainAppNavigator /> : <AuthNavigator />;
};

export default AppNavigator;