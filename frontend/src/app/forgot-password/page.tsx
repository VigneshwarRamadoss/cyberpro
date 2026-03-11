'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async () => {
    // In MVP, this is UI-only
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-input bg-primary flex items-center justify-center">
              <Shield size={22} className="text-white" />
            </div>
            <span className="text-h2 text-text-primary font-bold">ShieldSpeak</span>
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-card p-8 shadow-card">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <h2 className="text-h3 text-text-primary mb-2">Check Your Email</h2>
              <p className="text-body text-text-secondary mb-6">
                If an account exists with that email, you will receive password reset instructions shortly.
              </p>
              <Link href="/login">
                <Button variant="secondary">
                  <ArrowLeft size={16} /> Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-h3 text-text-primary mb-2">Forgot Password</h2>
              <p className="text-body text-text-secondary mb-6">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button type="submit" className="w-full">
                  Send Reset Link
                </Button>
              </form>
              <p className="mt-6 text-body text-text-muted text-center">
                <Link href="/login" className="text-primary hover:text-primary-hover transition-colors">
                  <ArrowLeft size={14} className="inline mr-1" />
                  Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
