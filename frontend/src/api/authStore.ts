import api from './axios';
import axios from 'axios';

export type AuthRole = 'customer' | 'manager' | 'employee';

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: AuthRole;
  phoneNumber: string;
  address: string;
}

export interface RegisterAuthInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  role: AuthRole;
}

interface AuthResponse {
  message: string;
  user: AuthUser | null;
}

function normalizeUser(user: AuthUser | null): AuthUser | null {
  console.log("NORMALIZING USER → incoming:", user)

  if (!user) return null

  const normalized = {
    ...user,
    role: user.role?.toLowerCase() as AuthRole,
  }

  console.log("NORMALIZED USER → outgoing:", normalized)
  return normalized
}

export async function fetchCurrentAuthUser() {
  const { data } = await api.get<AuthResponse>('/api/auth/me');
  return normalizeUser(data.user);
}

export async function loginAuthUser(email: string, password: string) {
  try {
    const { data } = await api.post<AuthResponse>('/api/auth/login', { email, password });
    return {
      user: normalizeUser(data.user),
      error: data.user ? null : data.message || 'Invalid email or password.',
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return {
        user: null,
        error: error.response?.data?.message ?? 'Unable to log in.',
      };
    }
    return { user: null, error: 'Unable to log in.' };
  }
}

export async function registerAuthUser(input: RegisterAuthInput) {
  try {
    const { data } = await api.post<AuthResponse>('/api/auth/register', input);
    return {
      user: normalizeUser(data.user),
      error: data.user ? null : data.message || 'Unable to register.',
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return {
        user: null,
        error: error.response?.data?.message ?? 'Unable to register.',
      };
    }
    return { user: null, error: 'Unable to register.' };
  }
}

export async function logoutAuthUser() {
  await api.post('/api/auth/logout');
}
