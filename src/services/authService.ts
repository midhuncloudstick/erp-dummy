import { api } from './EventServices';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@/types/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.postEvents('/login', credentials);
    return response.data;
  },

  async register(userInfo: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.postEvents('/customer', userInfo);
    return response.data;
  },

  async forgotPassword(email: string, user_type?: 'customer' | 'admin'): Promise<{ message: string; success: boolean; userType?: string }> {
    const payload: { email: string; user_type?: 'customer' | 'admin' } = { email };
    if (user_type) {
      payload.user_type = user_type;
    }
    const response = await api.postEvents('/password/forgot', payload);
    return response.data;
  },

  async resetPassword(email: string, password: string, confirmPassword: string, userType?: 'customer' | 'admin'): Promise<{ message: string; success: boolean }> {
    const url = `/password/create?email=${encodeURIComponent(email)}${userType ? `&type=${userType}` : ''}`;
    const response = await api.patchEvent(url, {
      password,
      confirm_password: confirmPassword,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  async updatePassword(userId: number, currentPassword: string, newPassword: string, confirmPassword: string, userType: 'customer' | 'admin'): Promise<{ message: string; success: boolean }> {
    const url = `/user/${userId}/password/reset?user_type=${userType}`;
    const response = await api.patchEvent(url, {
      current_password: currentPassword,
      password: newPassword,
      confirm_password: confirmPassword,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },
};
