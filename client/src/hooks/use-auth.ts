import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocalStorage } from './use-local-storage';
import { useToast } from './use-toast';
import { useEffect } from 'react';

// Define user type
interface User {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
  skills?: string[];
  resumeId?: number | null;
  resume?: {
    id: number;
    filename: string;
    uploadedAt?: string;
  } | null;
}

// Login credentials
interface LoginCredentials {
  username: string;
  password: string;
}

// Registration data
interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export function useAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Use local storage to persist authentication state
  const [persistedUser, setPersistedUser] = useLocalStorage<User | null>('handymatch-user', null);

  // Query to get the current user profile
  const { 
    data: user, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<User>({
    queryKey: ['/api/user/profile'],
    retry: false,
    refetchOnWindowFocus: false,
    initialData: persistedUser
  });

  // Login mutation
  const login = useMutation({
    mutationFn: (credentials: LoginCredentials) => 
      apiRequest('POST', '/api/auth/login', credentials),
    onSuccess: (data) => {
      // Store user data in local storage
      setPersistedUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      
      toast({
        title: 'Login successful!',
        description: `Welcome back, ${data.user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid username or password',
        variant: 'destructive',
      });
    },
  });

  // Register mutation
  const register = useMutation({
    mutationFn: (userData: RegisterData) => 
      apiRequest('POST', '/api/auth/register', userData),
    onSuccess: (data) => {
      // Store user data in local storage
      setPersistedUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      
      toast({
        title: 'Registration successful!',
        description: 'Your account has been created',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message || 'There was a problem with registration',
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logout = useMutation({
    mutationFn: () => apiRequest('POST', '/api/auth/logout'),
    onSuccess: () => {
      // Clear user data from local storage
      setPersistedUser(null);
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your account',
      });
    },
    onError: () => {
      toast({
        title: 'Logout failed',
        description: 'There was a problem logging out. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // If we have a persisted user but the API call fails, clear the persisted user
  useEffect(() => {
    if (error && persistedUser) {
      setPersistedUser(null);
    }
  }, [error, persistedUser, setPersistedUser]);

  return {
    user,
    isLoading,
    login: login.mutate,
    isLoginLoading: login.isPending,
    register: register.mutate,
    isRegisterLoading: register.isPending,
    logout: logout.mutate,
    isLogoutLoading: logout.isPending,
    refetch
  };
}