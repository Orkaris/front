import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; 

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
    headers: { 'Content-Type': 'application/json' }
  });
  // --------------------------------------

  useEffect(() => {
    // Vérifier si un token existe déjà au démarrage
    const bootstrapAsync = async () => {
      let token: string | null = null;
      try {
        token = await AsyncStorage.getItem('userToken');
        // Ici, vous pourriez aussi vouloir valider le token auprès de l'API
        // pour s'assurer qu'il n'a pas expiré côté serveur.
      } catch (e) {
        console.error("Restoring token failed", e);
      }
      setUserToken(token);
      setIsLoading(false);
    };
    bootstrapAsync();
  }, []);

  const authActions = React.useMemo(
    () => ({
      signIn: async (data: { email: string; password: string }) => {
        setIsLoading(true);
        try {
          // Remplacez par votre appel API réel
          const response = await authApi.post('/login', {
            email: data.email,
            password: data.password,
          });

          // --- Adapter selon la réponse de VOTRE API ---
          const token = response.data.token; // Ou response.data.accessToken, etc.
          // const userData = response.data.user; // Si l'API renvoie aussi l'user
          // --------------------------------------------

          if (token) {
            await AsyncStorage.setItem('userToken', token);
            setUserToken(token);
            // setUser(userData); // Mettre à jour l'objet user si nécessaire
            setIsSignout(false);
          } else {
             // Gérer le cas où le token n'est pas dans la réponse attendue
             throw new Error("Token non reçu après connexion.");
          }
        } catch (error: any) {
            console.error("Sign in error:", error.response?.data || error.message);
            // Propager l'erreur pour l'afficher dans le formulaire
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
            console.error("Sign out error", e);
        }
        setUserToken(null);
        // setUser(null);
        setIsSignout(true); // Marquer comme déconnecté pour la navigation
        setIsLoading(false);
      },
      signUp: async (data: { name: string; email: string; password: string }) => {
        setIsLoading(true);
        
        try {
          console.log(data.name, data.email, data.password);
            // Remplacez par votre appel API réel
            const response = await authApi.post('/register', {
                name: data.name, // Assurez-vous que le backend attend 'name' ou 'username'
                email: data.email,
                password: data.password,
            });

            // --- Gérer la réponse de l'inscription ---
            // Option 1: L'API renvoie un message de succès, rediriger vers Login
            console.log("Sign up successful:", response.data);
            // Ne pas définir de token ici, l'utilisateur doit se connecter

           // -----------------------------------------

        } catch (error: any) {
            console.error("Sign up error:", error.response?.data || error.message);
            // Propager l'erreur pour l'afficher dans le formulaire
            throw error;
        } finally {
            setIsLoading(false);
        }
      },
    }),
    [] // Dépendances du useMemo
  );

  return (
    <AuthContext.Provider value={{ ...authActions, userToken, isLoading, isSignout }}>
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