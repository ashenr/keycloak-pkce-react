import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { useAuth } from '../auth/AuthContext';
import { useMemo } from 'react';

// Load backend API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';

export const useApi = () => {
  const { getAccessToken } = useAuth();

  const axiosInstance: AxiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    instance.interceptors.request.use(
      (config) => {
        const token = getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // Server responded with error status
          const message = error.response.data?.detail || error.response.statusText || 'API request failed';
          throw new Error(message);
        } else if (error.request) {
          // Request was made but no response
          throw new Error('No response from server. Please check if the backend is running.');
        } else {
          // Error in request setup
          throw new Error(error.message || 'An error occurred');
        }
      }
    );

    return instance;
  }, [getAccessToken]);

  const get = async <T = any>(endpoint: string, config?: AxiosRequestConfig) => {
    const response = await axiosInstance.get<T>(endpoint, config);
    return response.data;
  };

  const post = async <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig) => {
    const response = await axiosInstance.post<T>(endpoint, data, config);
    return response.data;
  };

  const put = async <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig) => {
    const response = await axiosInstance.put<T>(endpoint, data, config);
    return response.data;
  };

  const del = async <T = any>(endpoint: string, config?: AxiosRequestConfig) => {
    const response = await axiosInstance.delete<T>(endpoint, config);
    return response.data;
  };

  const patch = async <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig) => {
    const response = await axiosInstance.patch<T>(endpoint, data, config);
    return response.data;
  };

  return { 
    axiosInstance, 
    get, 
    post, 
    put, 
    del, 
    patch 
  };
};
