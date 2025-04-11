import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Stack } from "expo-router";
import { i18n } from "@/src/i18n/i18n";

import { useAuth } from "../../context/AuthContext";
import { useThemeContext } from "@/src/context/ThemeContext";
import { AuthStackParamList } from "@/src/model/types";
import { ThemeType } from "@/src/theme/theme";

import SignInScreen from "@/src/app/authentication/signin";
import SignUpScreen from "@/src/app/authentication/register";
import Loader from "@/src/components/loader";
import { useLanguageContext } from "@/src/services/LanguageContext";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const options = ({ theme }: { theme: ThemeType }) => {
  return {
    headerTitle: '',
    headerBackTitle: i18n.t('navigation.back'),
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: theme.colors.background,
    },
  };
}

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="authentication/signin" component={SignInScreen} />
    <AuthStack.Screen name="authentication/register" component={SignUpScreen} />
  </AuthStack.Navigator>
);

const MainAppNavigator = ({ theme }: { theme: ThemeType }) => (
  <Stack>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="settings" options={{
      headerTitle: '',
      headerBackTitle: i18n.t('navigation.back'),
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
    }} />
    <Stack.Screen name="newTraining" options={{
      headerTitle: '',
      headerBackTitle: i18n.t('navigation.back'),
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
    }} />
  </Stack>
);

export default function AppNavigator() {
  const { userToken, isLoading } = useAuth();
  const { theme } = useThemeContext();
  const { language } = useLanguageContext();

  if (isLoading) {
    return <Loader />
  }

  return <MainAppNavigator theme={theme} />;
}
