'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuthStore } from '@/store/useAuthStore';

// Schema for registration with password match validation
const signupSchema = zod.object({
  name: zod.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: zod.string().min(1, 'Email is required').email('Invalid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: zod.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupSchemaType = zod.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signup, googleLogin, appleLogin, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
  } = useForm<SignupSchemaType>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupSchemaType) => {
    const success = await signup(data.name, data.email, data.password);
    if (success) {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-background text-primary flex items-center justify-center p-6 relative">
        {/* Decorative gradients */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[420px] bg-white rounded-[32px] p-8 shadow-[0px_8px_32px_rgba(0,0,0,0.03)] border border-outline-variant/15 relative z-10 text-center">
          <span className="material-symbols-outlined text-[64px] text-secondary fill-1 mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
          <h2 className="text-xl font-bold text-primary font-display mb-2">Check Your Email</h2>
          <p className="text-xs text-outline font-medium mb-8 leading-relaxed">
            We&apos;ve sent a secure verification link to your email address. Please check your inbox (and spam folder) and click the link to activate your account.
          </p>
          <Link href="/auth/login" className="bg-secondary text-white font-bold py-3.5 px-6 rounded-2xl flex w-full items-center justify-center hover:bg-primary transition-all active:scale-95 shadow-md">
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

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
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 justify-center mb-3">
            <span className="material-symbols-outlined text-[36px] text-secondary fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>
              nutrition
            </span>
            <span className="font-display text-headline-lg font-bold text-primary tracking-tight">
              FreshMart <span className="text-secondary">NZ</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-primary font-display">Create an Account</h2>
          <p className="text-xs text-outline font-medium mt-1">
            Join us to buy fresh organic groceries today!
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 p-3.5 bg-error/5 text-error rounded-2xl border border-error/15 text-xs font-semibold flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Signup form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-outline block mb-1.5">Full Name</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined text-outline absolute left-3.5 text-[20px]">
                badge
              </span>
              <input
                type="text"
                placeholder="Sanjay Rana"
                {...register('name')}
                className={`w-full text-sm py-3 pl-11 pr-4 bg-background rounded-2xl border ${
                  errors.name ? 'border-error ring-1 ring-error/10' : 'border-outline-variant/40 focus:ring-2 focus:ring-secondary/20 focus:border-secondary'
                } text-primary`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-error font-semibold mt-1 pl-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email Address */}
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

          {/* Password */}
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

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-bold text-outline block mb-1.5">Confirm Password</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined text-outline absolute left-3.5 text-[20px]">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                className={`w-full text-sm py-3 pl-11 pr-4 bg-background rounded-2xl border ${
                  errors.confirmPassword ? 'border-error ring-1 ring-error/10' : 'border-outline-variant/40 focus:ring-2 focus:ring-secondary/20 focus:border-secondary'
                } text-primary`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-error font-semibold mt-1 pl-1">{errors.confirmPassword.message}</p>
            )}
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
                <span>Creating account...</span>
              </>
            ) : (
              <span>Sign Up</span>
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
            <span>Sign up with Google</span>
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
            <span>Sign up with Apple</span>
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs font-semibold text-outline border-t border-outline-variant/10 pt-6">
          <span>Already have an account?</span>{' '}
          <Link href="/auth/login" className="text-secondary hover:underline font-bold">
            Log In
          </Link>
        </div>
      </div>
    </main>
  );
}
