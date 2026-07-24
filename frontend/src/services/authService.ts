import { apiClient } from './apiClient';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

const TOKEN_KEY = 'loan_ai_access_token';
const USER_KEY = 'loan_ai_user_profile';

export const authService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): UserProfile | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  setAuthSession(response: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, response.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  },

  clearAuthSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = (await apiClient.post('/auth/login', { email, password })) as unknown as AuthResponse;
    this.setAuthSession(response);
    return response;
  },

  async register(email: string, password: string, fullName?: string): Promise<AuthResponse> {
    const response = (await apiClient.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    })) as unknown as AuthResponse;
    this.setAuthSession(response);
    return response;
  },

  async fetchCurrentUser(): Promise<UserProfile | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const user = (await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })) as unknown as UserProfile;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch {
      this.clearAuthSession();
      return null;
    }
  },

  logout() {
    this.clearAuthSession();
  },
};
