import axios, { AxiosResponse } from 'axios';
import { User } from '../models/user';

const api = axios.create({
  baseURL: 'http://localhost:4000',
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
  window.location.href = 'http://localhost:4000/auth/spotify/login';
  console.log('Redirecting to Spotify login');
};

export default api;