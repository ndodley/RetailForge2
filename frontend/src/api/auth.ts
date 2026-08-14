import api from './apiClient';
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
  avatar_path: string | null;
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

interface AuthRequestMessages {
  invalidResultMessage: string;
  failureMessage: string;
}

async function submitAuthRequest(
  url: string,
  payload: unknown,
  { invalidResultMessage, failureMessage }: AuthRequestMessages,
) {
  try {
    const { data } = await api.post<AuthResponse>(url, payload);
    return {
      user: normalizeUser(data.user),
      error: data.user ? null : data.message || invalidResultMessage,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      return {
        user: null,
        error: error.response?.data?.message ?? failureMessage,
      };
    }
    return { user: null, error: failureMessage };
  }
}

export async function loginAuthUser(email: string, password: string) {
  return submitAuthRequest(
    '/api/auth/login',
    { email, password },
    { invalidResultMessage: 'Invalid email or password.', failureMessage: 'Unable to log in.' },
  );
}

export async function registerAuthUser(input: RegisterAuthInput) {
  return submitAuthRequest(
    '/api/auth/register',
    input,
    { invalidResultMessage: 'Unable to register.', failureMessage: 'Unable to register.' },
  );
}

export async function logoutAuthUser() {
  await api.post('/api/auth/logout');
}
