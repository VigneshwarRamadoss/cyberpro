import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mx-auto mb-6">
          <Shield className="h-8 w-8 text-text-muted" />
        </div>
        <h1 className="text-display text-text-primary mb-2">404</h1>
        <p className="text-body-lg text-text-secondary mb-6">This page could not be found.</p>
        <Link href="/" className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-input font-medium hover:bg-primary-hover transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );
}
