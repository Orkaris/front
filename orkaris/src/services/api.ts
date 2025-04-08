import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE_URL = 'http://127.0.0.1:5000/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const AUTH_TOKEN_KEY = 'userToken';

api.interceptors.request.use(
  async (config): Promise<InternalAxiosRequestConfig> => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Token ajouté à la requête pour:', config.url);
      } else {
        console.log('Aucun token trouvé, requête envoyée sans Authorization pour:', config.url);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du token depuis AsyncStorage", error);
    }
    return config;
  },
  (error) => {
    console.error("Erreur de configuration de la requête Axios", error);
    return Promise.reject(error);
  }
);

export const apiService = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = (await api.get<T>(url, config));
      return response.data;
    } catch (error) {
      console.error(`GET ${url} failed`, error);
      throw error;
    }
  },

  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`POST ${url} failed`, error);
      throw error;
    }
  },

  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      console.error(`PUT ${url} failed`, error);
      throw error;
    }
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api.delete<T>(url, config);
      return response.data;
    } catch (error) {
      console.error(`DELETE ${url} failed`, error);
      throw error;
    }
  },
};
