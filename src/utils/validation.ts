/**
 * Enterprise Validation & Input Sanitization Suite
 * Apna Bazar High-Security E-Commerce Architecture
 */

import { DeliveryAddress } from '../types';

/**
 * Sanitizes input string to prevent XSS and script injection attacks
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Strip angle brackets
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Validates Indian 10-digit mobile number (/^[6-9]\d{9}$/)
 */
export function validateIndianPhone(phone: string): { valid: boolean; error?: string; formatted?: string } {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  
  if (!cleanPhone) {
    return { valid: false, error: 'Mobile number is required' };
  }

  if (cleanPhone.length !== 10) {
    return { valid: false, error: 'Mobile number must be exactly 10 digits' };
  }

  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    return { valid: false, error: 'Must be a valid Indian mobile number starting with 6, 7, 8, or 9' };
  }

  return { valid: true, formatted: cleanPhone };
}

/**
 * Validates 6-digit WhatsApp OTP
 */
export function validateOtp(otp: string): { valid: boolean; error?: string } {
  const cleanOtp = otp.replace(/\D/g, '').trim();
  if (cleanOtp.length !== 6) {
    return { valid: false, error: 'OTP must be exactly 6 digits' };
  }
  return { valid: true };
}

/**
 * Validates 6-digit Indian Postal Pincode (/^\d{6}$/)
 */
export function validatePincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode.trim());
}

/**
 * Validates complete delivery address schema
 */
export function validateDeliveryAddress(addr: Partial<DeliveryAddress>): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!addr.fullName || sanitizeInput(addr.fullName).length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }

  const phoneCheck = validateIndianPhone(addr.phoneNumber || '');
  if (!phoneCheck.valid) {
    errors.phoneNumber = phoneCheck.error || 'Invalid mobile number';
  }

  if (!addr.streetAddress || sanitizeInput(addr.streetAddress).length < 5) {
    errors.streetAddress = 'Flat/House no. and street address is required';
  }

  if (!addr.city || sanitizeInput(addr.city).length < 2) {
    errors.city = 'City/Town is required';
  }

  if (!addr.pincode || !validatePincode(addr.pincode)) {
    errors.pincode = 'Valid 6-digit Indian pincode is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
