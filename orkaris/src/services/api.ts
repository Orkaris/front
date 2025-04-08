import axios, { AxiosRequestConfig } from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/'; // Replace with your API base URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
