import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { AuthState, ConnectUser, CreateUser, DecodedToken, ResponseToken, User } from '@/src/model/types';
import { apiService } from '../services/api';

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

        if (idFromToken) {
          setUserId(idFromToken);
          setUserToken(token);
          setIsSignout(false);
        } else {
          setUserId(null);
          setUserToken(null);
        }
      } catch (e) {
        setUserId(null);
        setUserToken(null);
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
          console.log("Token reçu:", receivedToken);
          if (receivedToken) {
            await AsyncStorage.setItem('userToken', receivedToken);
            console.log("Token enregistré dans AsyncStorage");

            setUserToken(receivedToken);
            processToken(receivedToken);
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
        } catch (e) {
        }
        processToken(null);
        setIsSignout(true);
        setIsLoading(false);
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
    }),
    [processToken]
  );

  return (
    <AuthContext.Provider value={{ ...authActions, userToken, userId, isLoading, isSignout, }}>
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