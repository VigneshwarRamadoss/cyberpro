'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/hooks/useAuth';
import { showToast } from '@/hooks/useToast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setServerError('');
    try {
      await authApi.login(data);
      const meRes = await authApi.me();
      setUser(meRes.data);
      showToast('Welcome back!', 'success');
      if (meRes.data.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setServerError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-input bg-primary flex items-center justify-center">
              <Shield size={22} className="text-white" />
            </div>
            <span className="text-h2 text-text-primary font-bold">ShieldSpeak</span>
          </Link>
          <p className="text-body text-text-secondary">Sign in to your account</p>
        </div>

        {/* Form */}
        <div className="bg-surface border border-border rounded-card p-8 shadow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
              <div className="px-4 py-3 rounded-input bg-danger/10 border border-danger/30 text-danger text-body" role="alert">
                {serverError}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <Link
              href="/forgot-password"
              className="text-body text-primary hover:text-primary-hover transition-colors"
            >
              Forgot your password?
            </Link>
            <p className="text-body text-text-muted">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary hover:text-primary-hover transition-colors font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 bg-card/50 border border-border rounded-card p-4">
          <p className="text-caption text-text-muted text-center mb-2">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-3 text-caption">
            <div className="bg-surface rounded-input p-2.5 border border-border">
              <p className="text-text-secondary font-medium">Admin</p>
              <p className="text-text-primary">admin@shieldspeak.com</p>
              <p className="text-text-secondary">any password</p>
            </div>
            <div className="bg-surface rounded-input p-2.5 border border-border">
              <p className="text-text-secondary font-medium">User</p>
              <p className="text-text-primary">alex@demo.com</p>
              <p className="text-text-secondary">any password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
