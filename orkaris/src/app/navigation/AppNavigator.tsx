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
import { useLanguageContext } from "@/src/context/LanguageContext";

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
      headerTintColor: theme.colors.navigationIcon,
    }} />
    <Stack.Screen name="program/[id]" options={{
      headerTitle: i18n.t('navigation.my_sessions'),
      headerBackTitle: i18n.t('navigation.back'),
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerTintColor: theme.colors.navigationIcon,
    }} />
    <Stack.Screen name="program/new" options={{
      headerTitle: i18n.t('program.new'),
      headerBackTitle: i18n.t('navigation.back'),
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerTintColor: theme.colors.navigationIcon,
    }} />
    <Stack.Screen name="session/[id]" options={{
      headerTitle: '',
      headerBackTitle: i18n.t('navigation.back'),
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerTintColor: theme.colors.navigationIcon,
    }} />
    <Stack.Screen name="session/new" options={{
      headerTitle: i18n.t('session.new'),
      headerBackTitle: i18n.t('navigation.back'),
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerTintColor: theme.colors.navigationIcon,
    }} />
    <Stack.Screen name="session/edit" options={{
      headerTitle: i18n.t('session.edit'),
      headerBackTitle: i18n.t('navigation.back'),
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerTintColor: theme.colors.navigationIcon,
    }} />
    <Stack.Screen name="session/log-workout" options={{
      headerTitle: i18n.t('session.log_workout'),
      headerBackTitle: i18n.t('navigation.back'),
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerTintColor: theme.colors.navigationIcon,
    }} />
    <Stack.Screen name="session/stats" options={{
      headerTitle: i18n.t('session.stats'),
      headerBackTitle: i18n.t('navigation.back'),
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerTintColor: theme.colors.navigationIcon,
    }} />
    <Stack.Screen name="session/select-exercise" options={{
      headerTitle: i18n.t('session.select_exercise'),
      headerBackTitle: i18n.t('navigation.back'),
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerTintColor: theme.colors.navigationIcon,
    }} />
    <Stack.Screen name="exercise/[id]" options={{
      headerTitle: i18n.t('exercise.details'),
      headerBackTitle: i18n.t('navigation.back'),
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerTintColor: theme.colors.navigationIcon,
    }} />
    <Stack.Screen name="exercise/new" options={{
      headerTitle: i18n.t('exercise.new'),
      headerBackTitle: i18n.t('navigation.back'),
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerTintColor: theme.colors.navigationIcon,
    }} />
    <Stack.Screen name="profile/edit" options={{
      headerTitle: i18n.t('edit_profile.title'),
      headerBackTitle: i18n.t('navigation.back'),
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: theme.colors.background,
      },
      headerTintColor: theme.colors.navigationIcon,
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

  return userToken ? <MainAppNavigator theme={theme} /> : <AuthNavigator />;
}
