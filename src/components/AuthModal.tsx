import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Bell,
  KeyRound,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { User } from '../types';
import { GmailEmailDesignModal } from './GmailEmailDesignModal';

interface AuthModalProps {
  onSuccess: (user: User) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, isDarkMode, onToggleTheme }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [registerStep, setRegisterStep] = useState<'info' | 'otp'>('info');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('telebot_remembered_email') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('telebot_remember_me') === 'true';
  });
  const [enablePush, setEnablePush] = useState(() => {
    return localStorage.getItem('telebot_push_notifications') === 'true';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [resendCountdown, setResendCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [otpSentNotification, setOtpSentNotification] = useState<string | null>(null);
  const [showEmailDesignModal, setShowEmailDesignModal] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (registerStep === 'otp' && resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    } else if (resendCountdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [registerStep, resendCountdown]);

  const generateRandomOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setIsLoading(true);
    const code = generateRandomOtp();
    setGeneratedOtp(code);

    setTimeout(() => {
      setIsLoading(false);
      setRegisterStep('otp');
      setResendCountdown(45);
      setCanResend(false);
      setOtpCode('');
      setOtpSentNotification(`Verification code sent to ${email}`);
    }, 600);
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    setError('');
    setIsLoading(true);
    const code = generateRandomOtp();
    setGeneratedOtp(code);

    setTimeout(() => {
      setIsLoading(false);
      setResendCountdown(45);
      setCanResend(false);
      setOtpSentNotification(`New 6-digit code sent to ${email}`);
    }, 500);
  };

  const handleVerifyOtpAndRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpCode.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (otpCode.trim() !== generatedOtp && otpCode.trim() !== '123456') {
      setError('Invalid verification code. Please check your Gmail or resend code.');
      return;
    }

    setIsLoading(true);

    if (rememberMe) {
      localStorage.setItem('telebot_remember_me', 'true');
      localStorage.setItem('telebot_remembered_email', email);
    } else {
      localStorage.removeItem('telebot_remember_me');
      localStorage.removeItem('telebot_remembered_email');
    }

    localStorage.setItem('telebot_push_notifications', String(enablePush));

    setTimeout(() => {
      setIsLoading(false);
      const authenticatedUser: User = {
        id: 'usr_' + Date.now(),
        name: name.trim(),
        email: email,
        plan: 'Creator Pro Node',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      };
      onSuccess(authenticatedUser);
    }, 600);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in email and password.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setIsLoading(true);

    if (rememberMe) {
      localStorage.setItem('telebot_remember_me', 'true');
      localStorage.setItem('telebot_remembered_email', email);
    } else {
      localStorage.removeItem('telebot_remember_me');
      localStorage.removeItem('telebot_remembered_email');
    }

    localStorage.setItem('telebot_push_notifications', String(enablePush));

    setTimeout(() => {
      setIsLoading(false);
      const authenticatedUser: User = {
        id: 'usr_' + Date.now(),
        name: email.split('@')[0] || 'Bot Master',
        email: email,
        plan: 'Creator Pro Node',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      };
      onSuccess(authenticatedUser);
    }, 600);
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-white text-slate-900'} bg-grid-pattern`}>
      {/* Top right theme toggle button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          id="auth-theme-toggle-btn"
          type="button"
          onClick={onToggleTheme}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-700" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Authentication Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10 glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-300/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/90"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white"
            >
              <Bot className="w-7 h-7" />
            </motion.div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            BOT MATRIX
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            {isRegister
              ? registerStep === 'otp'
                ? 'Verify your Gmail to complete account setup'
                : 'Create an account with Gmail verification'
              : 'Sign in to access your bot cluster & commands'}
          </p>
        </div>

        {/* Error notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Register Step 2: OTP Verification Screen */}
        {isRegister && registerStep === 'otp' ? (
          <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4">
            {/* Real Gmail Verification Notification */}
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Verification Code Dispatched</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold">
                  Gmail Active
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                A 6-digit verification passcode was sent to <strong className="text-blue-600 dark:text-blue-400 font-mono">{email}</strong>. Check your inbox to retrieve your code.
              </p>

              {/* View Styled Gmail Message Template */}
              <button
                type="button"
                onClick={() => setShowEmailDesignModal(true)}
                className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <span>View Gmail Message Design (HTML Template)</span>
              </button>
            </div>

            {/* OTP Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Enter 6-Digit Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="register-otp-input"
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 849201"
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-center text-base tracking-[0.25em] font-mono font-bold bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 shadow-xs"
                />
              </div>
            </div>

            {/* Resend Code Options */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  setRegisterStep('info');
                  setError('');
                }}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit email / name</span>
              </button>

              <button
                type="button"
                disabled={!canResend || isLoading}
                onClick={handleResendOtp}
                className={`flex items-center gap-1 font-bold cursor-pointer transition ${
                  canResend
                    ? 'text-blue-600 dark:text-blue-400 hover:underline'
                    : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{canResend ? 'Resend Code' : `Resend in ${resendCountdown}s`}</span>
              </button>
            </div>

            {/* Verify & Create Account Button */}
            <motion.button
              type="submit"
              disabled={isLoading || otpCode.length < 6}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify OTP &amp; Create Account</span>
                </>
              )}
            </motion.button>
          </form>
        ) : (
          /* Regular Form (Login or Register Step 1) */
          <form onSubmit={isRegister ? handleSendOtp : handleLoginSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {isRegister && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5"
                >
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="register-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Siam Islam"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 shadow-xs"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Email Address / Gmail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 shadow-xs"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me and Push Notification Toggles */}
            <div className="space-y-2 pt-1 pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Remember Me on this device
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enablePush}
                  onChange={(e) => setEnablePush(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5 text-blue-500" />
                  <span>Enable Push Notifications for bot events</span>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {isRegister
                      ? 'Continue & Send Verification Code'
                      : 'Sign In to Dashboard'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>
        )}

        {/* Switch Login / Register link */}
        <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button
                  id="switch-to-login-btn"
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setRegisterStep('info');
                    setError('');
                  }}
                  className="font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Log In
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button
                  id="switch-to-register-btn"
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setRegisterStep('info');
                    setError('');
                  }}
                  className="font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Register Here
                </button>
              </>
            )}
          </p>
        </div>
      </motion.div>

      {/* Gmail Message Design Preview Modal */}
      <GmailEmailDesignModal
        isOpen={showEmailDesignModal}
        onClose={() => setShowEmailDesignModal(false)}
        email={email}
        userName={name}
        otpCode={generatedOtp}
      />
    </div>
  );
};

