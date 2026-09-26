import { request } from './client';
import { User, UserRole } from '../types';

export const authApi = {
  async login(role: UserRole, email: string, password: string): Promise<{ message: string; user: User }> {
    const rolePaths: Record<UserRole, string> = {
      student: '/api/auth/students/login',
      institute: '/api/auth/institutes/login',
      academician: '/api/auth/academicians/login',
    };
    return request(rolePaths[role], {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async signup(role: UserRole, payload: Record<string, any>): Promise<{ message: string; user: User }> {
    const rolePaths: Record<UserRole, string> = {
      student: '/api/auth/students/signup',
      institute: '/api/auth/institutes/signup',
      academician: '/api/auth/academicians/signup',
    };
    return request(rolePaths[role], {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMe(): Promise<{ user: User | null }> {
    try {
      return await request('/api/auth/me', { method: 'GET' });
    } catch {
      return { user: null };
    }
  },

  async logout(): Promise<{ message: string }> {
    return request('/api/auth/logout', { method: 'POST' });
  },

  async relayEmailLocally(email: string, otp_code: string, purpose: 'register' | 'reset'): Promise<boolean> {
    const relayUrls = [
      'http://localhost:5001/api/auth/relay-email',
      'http://127.0.0.1:5001/api/auth/relay-email',
    ];
    for (const url of relayUrls) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp_code, purpose }),
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (resp.ok) {
          const data = await resp.json();
          if (data && data.email_sent) return true;
        }
      } catch {
        // Ignore and try next relay URL
      }
    }
    return false;
  },

  async sendOtp(email: string): Promise<{ message: string; email_sent?: boolean; otp_code?: string }> {
    const res = await request<{ message: string; email_sent?: boolean; otp_code?: string }>('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    if (res && res.email_sent === false && res.otp_code) {
      const relayed = await this.relayEmailLocally(email, res.otp_code, 'register');
      if (relayed) {
        res.email_sent = true;
      }
    }
    return res;
  },

  async verifyOtp(email: string, otp: string): Promise<{ message: string }> {
    return request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  async forgotPassword(email: string): Promise<{ message: string; email_sent?: boolean; otp_code?: string }> {
    const res = await request<{ message: string; email_sent?: boolean; otp_code?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    if (res && res.email_sent === false && res.otp_code) {
      const relayed = await this.relayEmailLocally(email, res.otp_code, 'reset');
      if (relayed) {
        res.email_sent = true;
      }
    }
    return res;
  },

  async resetPassword(email: string, otp: string, new_password: string): Promise<{ message: string }> {
    return request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, new_password }),
    });
  },

  async getNotifications(): Promise<{ notifications: import('../types').NotificationItem[] }> {
    try {
      return await request('/api/auth/notifications', { method: 'GET' });
    } catch {
      return { notifications: [] };
    }
  },
};
