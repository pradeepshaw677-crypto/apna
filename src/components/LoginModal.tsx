import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  User, 
  Phone, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  Edit2
} from 'lucide-react';
import { UserProfile } from '../types';
import { api } from '../utils/api';
import { validateIndianPhone, validateOtp } from '../utils/validation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  // Mode: 'whatsapp' (Mobile OTP) | 'google'
  const [authMode, setAuthMode] = useState<'whatsapp'>('whatsapp');
  
  // WhatsApp OTP Flow State
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState<'phone' | 'verify'>('phone');
  const [resendTimer, setResendTimer] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Countdown timer effect for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  if (!isOpen) return null;

  // Google Sign-In with strict cryptographic verification (ZERO mock tokens allowed)
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id && googleClientId) {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: { credential?: string }) => {
            if (!response.credential) {
              setError('Google authentication failed to return credentials.');
              setIsLoading(false);
              return;
            }
            try {
              const res = await api.syncGoogleSession({ credential: response.credential });
              if (res && res.user) {
                onLoginSuccess(res.user);
                onClose();
              } else {
                setError('Failed to establish secure session.');
              }
            } catch (e: any) {
              setError(e.message || 'Cryptographic verification failed on server.');
            } finally {
              setIsLoading(false);
            }
          },
        });
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setError('Google Sign-In prompt was closed. Please continue with WhatsApp Mobile OTP below.');
            setIsLoading(false);
          }
        });
      } else {
        // Enforce zero mock tokens
        setError('Cryptographic Google ID verification active. To test instant login, use WhatsApp Mobile OTP below.');
        setIsLoading(false);
      }
    } catch (err: any) {
      console.warn("Google auth error:", err);
      setError(err?.message || 'Google Sign-In failed. Please continue with WhatsApp Mobile OTP below.');
      setIsLoading(false);
    }
  };

  // WhatsApp OTP Request: Send verification code to 10-digit Indian phone (+91 9153352808 bridge)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const phoneValidation = validateIndianPhone(phone);
    if (!phoneValidation.valid || !phoneValidation.formatted) {
      setError(phoneValidation.error || 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.sendWhatsAppOtp(phoneValidation.formatted);
      if (res.success) {
        setOtpStep('verify');
        setResendTimer(45);
        setAttemptsLeft(3);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send WhatsApp verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // WhatsApp OTP Verification: Validate code and establish HttpOnly session in Turso DB
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const phoneValidation = validateIndianPhone(phone);
    if (!phoneValidation.valid || !phoneValidation.formatted) {
      setError('Invalid phone number.');
      return;
    }

    const otpValidation = validateOtp(otp);
    if (!otpValidation.valid) {
      setError(otpValidation.error || 'Please enter the complete 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.verifyWhatsAppOtp(phoneValidation.formatted, otp.trim());
      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        throw new Error('Verification failed.');
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Verification failed. Please try again.';
      setError(errMsg);
      setAttemptsLeft((prev) => Math.max(0, prev - 1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isLoading) return;
    setError('');
    setIsLoading(true);

    try {
      const phoneValidation = validateIndianPhone(phone);
      if (!phoneValidation.valid || !phoneValidation.formatted) return;

      const res = await api.sendWhatsAppOtp(phoneValidation.formatted);
      if (res.success) {
        setResendTimer(45);
        setAttemptsLeft(3);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div 
        className="relative bg-white w-[calc(100vw-1.5rem)] sm:w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-400/20">
              <Lock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg">
                Sign in to Apna Bazar
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span>Secure Customer Authentication</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">15-Min Express Delivery</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* OPTION 1: 1-Click Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-2.5 shadow-xs transition-colors cursor-pointer active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>1-Click Sign In with Google</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
              Or with WhatsApp Mobile OTP
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* OPTION 2: 10-Digit Mobile Number -> WhatsApp OTP Flow via bridge +91 9153352808 */}
          {authMode === 'whatsapp' ? (
            <div className="space-y-3">
              {otpStep === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      10-Digit Indian Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setPhone(val);
                        }}
                        placeholder="9876543210"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-20 pr-3 py-2.5 font-bold text-slate-900 tracking-wider focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Must start with 6, 7, 8, or 9 • Instant WhatsApp verification via +91 9153352808
                    </p>
                  </div>

                  {error && (
                    <div className="text-rose-600 text-xs font-medium flex items-center gap-1.5 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || phone.length !== 10}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                      phone.length === 10
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{isLoading ? 'Sending WhatsApp OTP...' : 'Send WhatsApp OTP →'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3 text-xs animate-fadeIn">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Code dispatched via WhatsApp
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep('phone');
                          setOtp('');
                          setError('');
                        }}
                        className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Change</span>
                      </button>
                    </div>
                    <p className="font-mono font-bold text-emerald-950 text-xs">
                      +91 {phone}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700 block">
                        Enter 6-Digit WhatsApp Code
                      </label>
                      <span className="text-[10px] font-bold text-slate-400">
                        {attemptsLeft} attempt{attemptsLeft > 1 ? 's' : ''} left
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-center text-lg font-mono font-black tracking-widest text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {error && (
                    <div className="text-rose-600 text-xs font-medium flex items-center gap-1.5 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                      otp.length === 6
                        ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer active:scale-95'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{isLoading ? 'Verifying Code...' : 'Verify OTP & Log In →'}</span>
                  </button>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't receive code?"}
                    </span>
                    <button
                      type="button"
                      disabled={resendTimer > 0 || isLoading}
                      onClick={handleResendOtp}
                      className={`text-[11px] font-bold ${
                        resendTimer > 0
                          ? 'text-slate-400 cursor-not-allowed'
                          : 'text-amber-800 hover:underline cursor-pointer'
                      }`}
                    >
                      Resend WhatsApp OTP
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : null}

          {/* Security Notice */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Bank-Grade HttpOnly Session Security (Turso SQLite) • No credentials stored on device</span>
          </div>

        </div>
      </div>
    </div>
  );
};
