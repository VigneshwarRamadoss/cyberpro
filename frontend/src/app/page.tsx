'use client';

import React from 'react';
import Link from 'next/link';
import { PublicNav, Footer } from '@/components/layout/PublicNav';
import { Button } from '@/components/ui/Button';
import {
  Shield, MessageSquareText, Mic, AlertTriangle, BarChart3, Users,
  Lock, Eye, Scale, Brain, Zap, CheckCircle2
} from 'lucide-react';

const features = [
  {
    icon: <MessageSquareText className="h-6 w-6 text-primary" />,
    title: 'Text Analysis',
    description: 'Submit any message and get instant NLP-powered analysis for harmful content, with severity classification and guidance.',
  },
  {
    icon: <Mic className="h-6 w-6 text-accent" />,
    title: 'Voice Analysis',
    description: 'Upload or record audio messages. Our speech-to-text pipeline transcribes and analyzes spoken content for safety.',
  },
  {
    icon: <Brain className="h-6 w-6 text-info" />,
    title: 'Intelligent Detection',
    description: 'Transformer-based NLP models classify content by category, severity, and confidence with human-readable explanations.',
  },
  {
    icon: <AlertTriangle className="h-6 w-6 text-warning" />,
    title: 'Preventive Warnings',
    description: 'Real-time warnings for medium to high-risk content help users reconsider before harm escalates.',
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-success" />,
    title: 'Analytics & Trends',
    description: 'Track incident patterns, severity distributions, and moderation effectiveness over time.',
  },
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: 'Human-in-the-Loop',
    description: 'All flagged content is escalated for human review. No automated punitive actions. Moderators decide.',
  },
];

const safetyPrinciples = [
  {
    icon: <Eye className="h-5 w-5" />,
    title: 'Transparency',
    description: 'Every detection includes confidence scores and explanations. We never claim certainty.',
  },
  {
    icon: <Scale className="h-5 w-5" />,
    title: 'Fairness',
    description: 'No auto-bans. Sarcasm and ambiguity are handled with caution. Human review is always available.',
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: 'Privacy',
    description: 'Content analysis serves safety only. Data is handled securely with audit-friendly tracking.',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Care First',
    description: 'Language is calm, warnings are supportive. We protect without punishing.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="max-w-content mx-auto px-4 md:px-8 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-primary/10 border border-primary/20 text-primary text-small font-medium mb-6">
              <Shield size={14} />
              AI-Powered Communication Safety
            </div>
            <h1 className="text-display md:text-[3.5rem] md:leading-[4rem] text-text-primary mb-6">
              Safer Digital Spaces,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Powered by NLP
              </span>
            </h1>
            <p className="text-body-lg md:text-h4 text-text-secondary font-normal max-w-2xl mx-auto mb-10 leading-relaxed">
              ShieldSpeak detects cyberbullying in text and voice conversations using advanced natural language processing. Get real-time safety insights with human-reviewed moderation you can trust.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="min-w-[180px]">
                  <Zap size={18} />
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="min-w-[180px]">
                  Log In
                </Button>
              </Link>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-surface border border-border rounded-card p-6 shadow-elevated">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-card rounded-input p-4 border border-border">
                  <p className="text-caption text-text-muted">Total Analyses</p>
                  <p className="text-h2 text-text-primary font-bold">2,847</p>
                </div>
                <div className="bg-card rounded-input p-4 border border-border">
                  <p className="text-caption text-text-muted">Flagged Content</p>
                  <p className="text-h2 text-warning font-bold">142</p>
                </div>
                <div className="bg-card rounded-input p-4 border border-border">
                  <p className="text-caption text-text-muted">Resolved</p>
                  <p className="text-h2 text-success font-bold">98%</p>
                </div>
              </div>
              <div className="bg-card rounded-input p-4 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <p className="text-body text-text-secondary">Latest Analysis</p>
                  <span className="px-2 py-0.5 rounded-pill text-caption bg-success/20 text-success border border-success/30">Safe</span>
                </div>
                <p className="text-body text-text-muted italic">&quot;Hey, great work on the project today! Let&apos;s meet tomorrow to finalize.&quot;</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-surface/30">
        <div className="max-w-content mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h1 text-text-primary mb-3">Comprehensive Detection & Response</h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
              From text messages to voice recordings, ShieldSpeak provides end-to-end safety analysis with actionable insights.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card border border-border rounded-card p-6 hover:border-text-muted transition-all duration-150 hover:shadow-elevated"
              >
                <div className="w-12 h-12 rounded-input bg-background flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-h4 text-text-primary mb-2">{feature.title}</h3>
                <p className="text-body text-text-secondary leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section id="safety" className="py-20">
        <div className="max-w-content mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h1 text-text-primary mb-3">Safety by Design</h2>
            <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
              ShieldSpeak is built on principles that prioritize fairness, transparency, and compassion over punishment.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {safetyPrinciples.map((principle) => (
              <div key={principle.title} className="flex gap-4 p-5 rounded-card bg-card/50 border border-border">
                <div className="w-10 h-10 rounded-input bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {principle.icon}
                </div>
                <div>
                  <h3 className="text-body-lg font-semibold text-text-primary mb-1">{principle.title}</h3>
                  <p className="text-body text-text-secondary">{principle.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="max-w-content mx-auto px-4 md:px-8 text-center">
          <h2 className="text-h1 text-text-primary mb-4">Ready to Build Safer Spaces?</h2>
          <p className="text-body-lg text-text-secondary max-w-xl mx-auto mb-8">
            Join communities using ShieldSpeak to create welcoming, monitored digital environments.
          </p>
          <Link href="/signup">
            <Button size="lg" className="min-w-[200px]">
              <CheckCircle2 size={18} />
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
