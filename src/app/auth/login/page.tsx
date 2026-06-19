'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

// Schema for login validation
const loginSchema = zod.object({
  email: zod.string().min(1, 'Email is required').email('Invalid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
});

type LoginSchemaType = zod.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, googleLogin, appleLogin, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('verified') === 'true') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsVerified(true);
      }
    }
  }, []);

  // If already authenticated, redirect to home page
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
    return () => {
      clearError();
    };
  }, [isAuthenticated, router, clearError]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginSchemaType) => {
    const success = await login(data.email, data.password, rememberMe);
    if (success) {
      router.push('/');
    }
  };

  const handleOpenForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setForgotPasswordEmail(watch('email') || '');
    setResetMessage('');
    setIsForgotPasswordOpen(true);
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) return;
    setIsResetting(true);
    setResetMessage('');
    const { resetPassword } = useAuthStore.getState();
    const res = await resetPassword(forgotPasswordEmail);
    setIsResetting(false);
    setResetMessage(res.message);
  };

  return (
    <main className="min-h-screen bg-background text-primary flex items-center justify-center p-6 relative">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />



      {/* Main card */}
      <div className="w-full max-w-[420px] bg-white rounded-[32px] p-8 shadow-[0px_8px_32px_rgba(0,0,0,0.03)] border border-outline-variant/15 relative z-10 flex flex-col">
        
        {/* Integrated Back to Home button */}
        <div className="flex justify-start mb-2 -mt-2 -ml-2">
          <Link
            href="/"
            className="group inline-flex items-center gap-1 text-[10px] font-bold text-outline hover:text-secondary active:scale-95 transition-all bg-surface-container-low/50 py-1.5 px-3 rounded-xl border border-outline-variant/20"
          >
            <span className="material-symbols-outlined text-[14px] transition-transform group-hover:-translate-x-0.5">arrow_back</span>
            <span>Back to Store</span>
          </Link>
        </div>

        {/* Branding header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 justify-center mb-3">
            <span className="material-symbols-outlined text-[36px] text-secondary fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>
              nutrition
            </span>
            <span className="font-display text-headline-lg font-bold text-primary tracking-tight">
              FreshMart <span className="text-secondary">NZ</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-primary font-display">Welcome Back</h2>
          <p className="text-xs text-outline font-medium mt-1">
            Access premium locally sourced organic products
          </p>
        </div>



        {/* Verified success message */}
        {isVerified && (
          <div className="mb-5 p-3.5 bg-[#4CAF50]/10 text-[#4CAF50] rounded-2xl border border-[#4CAF50]/20 text-xs font-semibold flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] mt-0.5">check_circle</span>
            <span>Email successfully verified! You can now sign in.</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-5 p-3.5 bg-error/5 text-error rounded-2xl border border-error/15 text-xs font-semibold flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Email field */}
          <div>
            <label className="text-xs font-bold text-outline block mb-1.5">Email Address</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined text-outline absolute left-3.5 text-[20px]">
                mail
              </span>
              <input
                type="email"
                placeholder="you@gmail.co.nz"
                {...register('email')}
                className={`w-full text-sm py-3 pl-11 pr-4 bg-background rounded-2xl border ${
                  errors.email ? 'border-error ring-1 ring-error/10' : 'border-outline-variant/40 focus:ring-2 focus:ring-secondary/20 focus:border-secondary'
                } text-primary`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-error font-semibold mt-1 pl-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label className="text-xs font-bold text-outline block mb-1.5">Password</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined text-outline absolute left-3.5 text-[20px]">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={`w-full text-sm py-3 pl-11 pr-11 bg-background rounded-2xl border ${
                  errors.password ? 'border-error ring-1 ring-error/10' : 'border-outline-variant/40 focus:ring-2 focus:ring-secondary/20 focus:border-secondary'
                } text-primary`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-outline hover:text-primary active:scale-90 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-error font-semibold mt-1 pl-1">{errors.password.message}</p>
            )}
          </div>

          {/* Remember details */}
          <div className="flex items-center justify-between text-xs py-1">
            <label className="flex items-center gap-2 cursor-pointer text-on-surface-variant font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-outline-variant text-secondary accent-secondary focus:ring-secondary/20 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <button type="button" onClick={handleOpenForgotPassword} className="font-semibold text-secondary hover:underline bg-transparent border-none cursor-pointer">
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-secondary hover:bg-primary text-white font-bold py-3.5 px-6 rounded-2xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer mt-6"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={async () => {
              const success = await googleLogin();
              if (success) router.push('/');
            }}
            disabled={isLoading}
            className="w-full bg-white hover:bg-surface-container-low text-primary font-bold py-3.5 px-6 rounded-2xl transition-all active:scale-95 shadow-sm border border-outline-variant/20 flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer mt-3"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            <span>Sign in with Google</span>
          </button>

        </form>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs font-semibold text-outline border-t border-outline-variant/10 pt-6">
          <span>New to FreshMart NZ?</span>{' '}
          <Link href="/auth/signup" className="text-secondary hover:underline font-bold">
            Create an Account
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isForgotPasswordOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsForgotPasswordOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed inset-x-4 top-1/3 max-w-sm mx-auto bg-white rounded-3xl p-6 shadow-2xl z-50 border border-outline-variant/15"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-bold text-lg text-primary">Reset Password</h3>
                <button
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              <p className="text-xs text-outline font-medium mb-5">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {resetMessage && (
                <div className="mb-4 p-3 bg-secondary-container/30 text-secondary-fixed-variant rounded-xl text-xs font-bold border border-secondary/20">
                  {resetMessage}
                </div>
              )}

              <form onSubmit={handleSendResetLink}>
                <input
                  type="email"
                  required
                  placeholder="you@gmail.co.nz"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="w-full text-sm py-3 px-4 bg-background rounded-xl border border-outline-variant/40 focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-primary mb-4"
                />
                <button
                  type="submit"
                  disabled={isResetting || !forgotPasswordEmail}
                  className="w-full bg-secondary hover:bg-primary text-white font-bold py-3 rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isResetting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}
