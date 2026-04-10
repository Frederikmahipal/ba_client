import axios, { AxiosResponse } from 'axios';
import { User } from '../models/user';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

export const login = async (email: string, password: string): Promise<User> => {
  const response: AxiosResponse<User> = await api.post('/auth/login', { email, password });
  return response.data;
};

export const signup = async (name: string, email: string, password: string): Promise<User> => {
  const response: AxiosResponse<User> = await api.post('/auth/signup', { name, email, password });
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const checkAuth = async (): Promise<User> => {
  const response: AxiosResponse<{ user: User }> = await api.get('/auth/check-auth');
  return response.data.user;
};

export const spotifyLogin = (): void => {
  window.location.href = `${apiBaseUrl}/auth/spotify/login`;
};

export default api;
