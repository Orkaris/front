import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { AuthState, ConnectUser, CreateUser, DecodedToken, ResponseToken, User } from '@/src/model/types';
import { apiService } from '../services/api';
import { router } from 'expo-router';

const AuthContext = createContext<AuthState | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignout, setIsSignout] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const processToken = useCallback((token: string | null) => {
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const idFromToken = decoded.sub;
        const expirationTime = decoded.exp ? decoded.exp * 1000 : 0; // Convert to milliseconds

        // Check if token is expired
        if (expirationTime === 0 || Date.now() >= expirationTime) {
          console.log("Token expired");
          setUserId(null);
          setUserToken(null);
          AsyncStorage.removeItem('userToken');
          router.replace('/authentication/signin');
          return;
        }

        if (idFromToken) {
          setUserId(idFromToken);
          setUserToken(token);
          setIsSignout(false);
        } else {
          setUserId(null);
          setUserToken(null);
          AsyncStorage.removeItem('userToken');
          router.replace('/authentication/signin');
        }
      } catch (e) {
        console.error("Error processing token:", e);
        setUserId(null);
        setUserToken(null);
        AsyncStorage.removeItem('userToken');
        router.replace('/authentication/signin');
      }
    } else {
      setUserId(null);
      setUserToken(null);
    }
  }, []);

  // --- Vérification du token au démarrage ---
  useEffect(() => {
    const bootstrapAsync = async () => {
      let token: string | null = null;
      setIsLoading(true);
      try {
        token = await AsyncStorage.getItem('userToken');
        processToken(token);
      } catch (e) {
        console.error("Error during bootstrap:", e);
        processToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapAsync();
  }, [processToken]);

  // --- Actions d'authentification ---
  const authActions = React.useMemo(
    () => ({
      signIn: async (data: ConnectUser) => {
        setIsLoading(true);
        try {
          const response = await apiService.post<ResponseToken>('/Users/login', {
            email: data.email,
            password: data.password,
          });

          const receivedToken = response.token;
          if (receivedToken) {
            await AsyncStorage.setItem('userToken', receivedToken);
            setUserToken(receivedToken);
            processToken(receivedToken);
            router.replace('/(tabs)');
          } else {
            throw new Error("Token non reçu après connexion.");
          }
        } catch (error: any) {
          processToken(null);
          throw error;
        } finally {
          setIsLoading(false);
        }
      },
      signOut: async () => {
        setIsLoading(true);
        try {
          await AsyncStorage.removeItem('userToken');
          processToken(null);
          setIsSignout(true);
          router.replace('/authentication/signin');
        } catch (e) {
          console.error("Error during signout:", e);
        } finally {
          setIsLoading(false);
        }
      },
      signUp: async (data: CreateUser) => {
        setIsLoading(true);
        try {
          await apiService.post('/Users/register', {
            name: data.name,
            email: data.email,
            password: data.password,
          });
        } catch (error: any) {
          throw error;
        } finally {
          setIsLoading(false);
        }
      },
      isAuthenticated: () => {
        return !!userToken && !!userId;
      },
    }),
    [processToken, userToken, userId]
  );

  return (
    <AuthContext.Provider value={{ ...authActions, userToken, userId, isLoading, isSignout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};