'use client';

import React from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function PublicNav() {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-content mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-input bg-primary flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <span className="text-h4 text-text-primary font-bold">ShieldSpeak</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="Public navigation">
          <a href="#features" className="text-body text-text-secondary hover:text-text-primary transition-colors">
            Features
          </a>
          <a href="#safety" className="text-body text-text-secondary hover:text-text-primary transition-colors">
            Safety
          </a>
          <Link href="/login" className="text-body text-text-secondary hover:text-text-primary transition-colors">
            Log In
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </nav>

        <div className="md:hidden flex items-center gap-3">
          <Link href="/login" className="text-body text-text-secondary">
            Log In
          </Link>
          <Link href="/signup">
            <Button size="sm">Sign Up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50 py-12">
      <div className="max-w-content mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-input bg-primary flex items-center justify-center">
                <Shield size={16} className="text-white" />
              </div>
              <span className="text-h4 font-bold text-text-primary">ShieldSpeak</span>
            </div>
            <p className="text-small text-text-muted leading-relaxed">
              AI-powered safety for digital communication. Protecting communities with intelligent, human-reviewed moderation.
            </p>
          </div>
          <div>
            <h4 className="text-body font-semibold text-text-primary mb-3">Product</h4>
            <ul className="space-y-2 text-small text-text-muted">
              <li><a href="#features" className="hover:text-text-secondary transition-colors">Features</a></li>
              <li><a href="#safety" className="hover:text-text-secondary transition-colors">Safety</a></li>
              <li><a href="#" className="hover:text-text-secondary transition-colors">Documentation</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-body font-semibold text-text-primary mb-3">Legal</h4>
            <ul className="space-y-2 text-small text-text-muted">
              <li><a href="#" className="hover:text-text-secondary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-text-secondary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-text-secondary transition-colors">Accessibility</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-body font-semibold text-text-primary mb-3">Support</h4>
            <ul className="space-y-2 text-small text-text-muted">
              <li><a href="#" className="hover:text-text-secondary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-text-secondary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-text-secondary transition-colors">Status</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-caption text-text-muted">
            © 2026 ShieldSpeak. Built with care for safer digital spaces.
          </p>
          <p className="text-caption text-text-muted mt-2 px-4 py-2 bg-surface/80 rounded inline-block border border-border">
            <strong>Hackathon MVP:</strong> All data is stored locally in this browser for demo purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}
