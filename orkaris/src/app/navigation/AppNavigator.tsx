import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Stack } from "expo-router";

import { useAuth } from "../../services/authContext"; // Adaptez le chemin

import SignInScreen from "../authentication/signin"; // Adaptez le chemin
import SignUpScreen from "../authentication/register"; // Adaptez le chemin
import EditProfileScreen from "../editprofile"; // Import the EditProfileScreen

import { AuthStackParamList } from "../../model/types";
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="authentication/signin" component={SignInScreen} />
    <AuthStack.Screen name="authentication/register" component={SignUpScreen} />
  </AuthStack.Navigator>
);

const MainAppNavigator = () => (
  <Stack>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  </Stack>
);

const AppNavigator = () => {
  const { userToken, isLoading } = useAuth();
  console.log("Token utilisateur dans AppNavigator:", userToken);
  console.log("État de chargement dans AppNavigator:", isLoading);
  if (isLoading) {
    // return <SplashScreen />;
  }

  return userToken ? <MainAppNavigator /> : <AuthNavigator />;
};

export default AppNavigator;
