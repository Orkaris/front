import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

import { AuthState } from '../model/types';

const AuthContext = createContext<AuthState | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignout, setIsSignout] = useState(false);

  // --- Configuration API ---
  const API_BASE_URL = 'http://127.0.0.1:5000/api';

  const authApi = axios.create({
    baseURL: API_BASE_URL + '/Users',
    timeout: 5000,
    headers: { 'Content-Type': 'application/json' },
  });

  // --- Vérification du token au démarrage ---
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          // Optionnel : Valider le token auprès de l'API
          const isValid = await validateToken(token);
          if (isValid) {
            setUserToken(token);
          } else {
            await AsyncStorage.removeItem('userToken');
          }
        }
      } catch (e) {
        console.error('Erreur lors de la restauration du token', e);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapAsync();
  }, []);

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await authApi.get('/validate-token', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.status === 200;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  };

  // --- Actions d'authentification ---
  const authActions = React.useMemo(
    () => ({
      signIn: async (data: { email: string; password: string }) => {
        setIsLoading(true);
        try {
          const response = await authApi.post('/login', {
            email: data.email,
            password: data.password,
          });

          const token = response.data.token;
          if (token) {
            await AsyncStorage.setItem('userToken', token);
            setUserToken(token);
            setIsSignout(false);
          } else {
            throw new Error('Token non reçu après connexion.');
          }
        } catch (error: any) {
          console.error('Erreur de connexion :', error.response?.data || error.message);
          throw error;
        } finally {
          setIsLoading(false);
        }
      },
      signOut: async () => {
        setIsLoading(true);
        try {
          await AsyncStorage.removeItem('userToken');
        } catch (e) {
          console.error('Erreur lors de la déconnexion', e);
        }
        setUserToken(null);
        setIsSignout(true);
        setIsLoading(false);
      },
      signUp: async (data: { name: string; email: string; password: string }) => {
        setIsLoading(true);
        try {
          const response = await authApi.post('/register', {
            name: data.name,
            email: data.email,
            password: data.password,
          });
          console.log('Inscription réussie :', response.data);
        } catch (error: any) {
          console.error('Erreur lors de l\'inscription :', error.response?.data || error.message);
          throw error;
        } finally {
          setIsLoading(false);
        }
      },
    }),
    []
  );

  const isAuthenticated = !!userToken;

  return (
    <AuthContext.Provider value={{ ...authActions, userToken, isAuthenticated, isLoading, isSignout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte facilement
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook pour rediriger si non authentifié
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/authentication/signin');
    }
  }, [isAuthenticated, isLoading, router]);
};