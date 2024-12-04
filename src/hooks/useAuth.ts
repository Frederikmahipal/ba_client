import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { login, signup, logout, checkAuth, spotifyLogin as spotifyLoginService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { User } from '../models/user';
import { useState } from 'react';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);

  const { data: user, isLoading: isCheckingAuth } = useQuery<User>({
    queryKey: ['user'],
    queryFn: checkAuth,
    retry: false,
  });

  // Add this getter for the access token
  const accessToken = user?.accessToken;

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/');
    },
    onError: (error: any) => {
      setLoginError(error.message || 'Login failed');
    },
  });

  const signupMutation = useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) => 
      signup(name, email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/');
    },
    onError: (error: any) => {
      setSignupError(error.message || 'Signup failed');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/login');
    },
  });

  const spotifyLoginMutation = () => {
    spotifyLoginService();
  };

  return {
    user,
    accessToken, 
    isCheckingAuth,
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout: logoutMutation.mutate,
    spotifyLogin: spotifyLoginMutation,
    loginError,
    signupError,
  };
};