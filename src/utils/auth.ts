/**
 * Client-Side Authentication Service & Session Manager
 * Uses HttpOnly cookie-based backend authentication
 * Zero sensitive JWT/credentials stored in localStorage
 */

import { UserProfile } from '../types';
import { api } from './api';

export const authService = {
  /**
   * Fetches the current authenticated session from the backend via HttpOnly cookies
   */
  async getCurrentSession(): Promise<UserProfile | null> {
    try {
      const data = await api.getSession();
      if (data && data.authenticated && data.user) {
        return data.user;
      }
    } catch (e) {
      console.warn('Session check notice:', e);
    }
    return null;
  },

  /**
   * Request 6-digit WhatsApp OTP for a 10-digit Indian mobile number
   */
  async sendWhatsAppOtp(phone: string): Promise<{ success: boolean; message: string }> {
    return await api.sendWhatsAppOtp(phone);
  },

  /**
   * Verify WhatsApp OTP and set HttpOnly session cookie
   */
  async verifyWhatsAppOtp(phone: string, otp: string): Promise<{ success: boolean; user: UserProfile; message?: string }> {
    return await api.verifyWhatsAppOtp(phone, otp);
  },

  /**
   * Complete Google Sign-In with cryptographic backend verification
   */
  async handleGoogleSession(credential: string): Promise<UserProfile> {
    const res = await api.syncGoogleSession({ credential });
    if (!res || !res.user) {
      throw new Error(res?.message || 'Failed to establish Google session');
    }
    return res.user;
  },

  /**
   * Log out current user and clear HttpOnly cookie
   */
  async logout(): Promise<void> {
    await api.logout();
  },
};
