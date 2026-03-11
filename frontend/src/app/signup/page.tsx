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

const signupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    setServerError('');
    try {
      const res = await authApi.signup({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
      });
      setUser(res.data);
      showToast('Account created successfully!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      setServerError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-input bg-primary flex items-center justify-center">
              <Shield size={22} className="text-white" />
            </div>
            <span className="text-h2 text-text-primary font-bold">ShieldSpeak</span>
          </Link>
          <p className="text-body text-text-secondary">Create your account</p>
        </div>

        <div className="bg-surface border border-border rounded-card p-8 shadow-card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
              <div className="px-4 py-3 rounded-input bg-danger/10 border border-danger/30 text-danger text-body" role="alert">
                {serverError}
              </div>
            )}

            <Input
              label="Full Name"
              placeholder="Your full name"
              error={errors.full_name?.message}
              {...register('full_name')}
            />

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
              autoComplete="new-password"
              placeholder="At least 8 characters"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your password"
              error={errors.confirm_password?.message}
              {...register('confirm_password')}
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-body text-text-muted text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary-hover transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
