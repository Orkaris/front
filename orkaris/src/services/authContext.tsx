import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { AuthState } from '../model/types';

interface DecodedToken {
  sub: string;
  name?: string;
  email?: string;
  exp?: number;
  iat?: number;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignout, setIsSignout] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const API_BASE_URL = 'http://127.0.0.1:5000/api';
  const authApi = axios.create({
    baseURL: API_BASE_URL + '/Users',
    timeout: 5000,
    headers: { 'Content-Type': 'application/json' }
  });

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

  const authActions = React.useMemo(
    () => ({
      signIn: async (data: { email: string; password: string }) => {
        setIsLoading(true);
        try {
          const response = await authApi.post('/login', {
            email: data.email,
            password: data.password,
          });

          const receivedToken = response.data.token;
          console.log("Token reçu:", receivedToken);
          if (receivedToken) {
            await AsyncStorage.setItem('userToken', receivedToken);
            console.log("Token enregistré dans AsyncStorage");
            
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
        } catch(e) {
        }
        processToken(null);
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
        } catch (error: any) {
            throw error;
        } finally {
            setIsLoading(false);
        }
      },
    }),
    [authApi, processToken]
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