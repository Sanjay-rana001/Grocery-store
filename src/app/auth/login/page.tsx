'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuthStore } from '@/store/useAuthStore';

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('verified') === 'true') {
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
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginSchemaType) => {
    const success = await login(data.email, data.password);
    if (success) {
      router.push('/');
    }
  };

  return (
    <main className="min-h-screen bg-background text-primary flex items-center justify-center p-6 relative">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating Back to Home button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-bold text-outline hover:text-secondary active:scale-95 bg-white py-2.5 px-4 rounded-full shadow-sm border border-outline-variant/10 transition-all"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        <span>Back to Store</span>
      </Link>

      {/* Main card */}
      <div className="w-full max-w-[420px] bg-white rounded-[32px] p-8 shadow-[0px_8px_32px_rgba(0,0,0,0.03)] border border-outline-variant/15 relative z-10">
        
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
                placeholder="you@email.co.nz"
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
                className="w-4 h-4 rounded border-outline-variant text-secondary accent-secondary focus:ring-secondary/20 cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <a href="#" className="font-semibold text-secondary hover:underline">
              Forgot password?
            </a>
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

          {/* Apple Sign In */}
          <button
            type="button"
            onClick={async () => {
              const success = await appleLogin();
              if (success) router.push('/');
            }}
            disabled={isLoading}
            className="w-full bg-black hover:bg-gray-900 text-white font-bold py-3.5 px-6 rounded-2xl transition-all active:scale-95 shadow-sm border border-black flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer mt-3"
          >
            <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="w-5 h-5 filter invert" />
            <span>Sign in with Apple</span>
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
    </main>
  );
}
