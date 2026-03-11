'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { analysisApi } from '@/lib/api';
import { showToast } from '@/hooks/useToast';
import { MessageSquareText, Sparkles } from 'lucide-react';

const analyzeSchema = z.object({
  text: z.string().min(1, 'Please enter some text to analyze').max(5000, 'Text must be under 5000 characters'),
});

type AnalyzeForm = z.infer<typeof analyzeSchema>;

const sampleTexts = [
  "Hey, great work on the project today! Let's meet tomorrow to finalize everything.",
  "You're such a loser, nobody wants to be your friend.",
  "I'm going to make sure everyone knows what you did. You can't hide.",
  "Thanks for helping me with my homework, you're a great study partner!",
  "Look at what you're wearing, you look so ugly and pathetic.",
];

function TextAnalysisContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AnalyzeForm>({
    resolver: zodResolver(analyzeSchema),
  });

  const textValue = watch('text', '');

  const onSubmit = async (data: AnalyzeForm) => {
    setIsLoading(true);
    try {
      const res = await analysisApi.analyzeText(data.text);
      showToast('Analysis complete', 'success');
      router.push(`/results/${res.data.id}`);
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Analysis failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = () => {
    const sample = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setValue('text', sample);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-h1 text-text-primary flex items-center gap-3">
          <MessageSquareText className="h-8 w-8 text-primary" />
          Analyze Text
        </h1>
        <p className="text-body text-text-secondary mt-1">
          Enter a message below to check for potentially harmful content. The analysis will classify
          the text, assign a severity level, and provide guidance.
        </p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="text-input" className="text-body font-medium text-text-secondary">
                Message Content
              </label>
              <span className="text-caption text-text-muted">
                {textValue.length}/5000
              </span>
            </div>
            <textarea
              id="text-input"
              className={`w-full px-4 py-3 bg-surface border border-border rounded-input text-text-primary placeholder:text-text-muted resize-y min-h-[180px] transition-colors duration-150 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${errors.text ? 'border-danger' : ''}`}
              placeholder="Type or paste a message to analyze..."
              maxLength={5000}
              {...register('text')}
            />
            {errors.text && (
              <p className="text-small text-danger mt-1">{errors.text.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button type="submit" isLoading={isLoading} size="lg">
              <Sparkles size={18} />
              Analyze Content
            </Button>
            <Button type="button" variant="ghost" onClick={loadSample} size="lg">
              Try Sample Text
            </Button>
          </div>
        </form>
      </Card>

      <div className="bg-card/50 border border-border rounded-card p-5">
        <h3 className="text-body font-semibold text-text-primary mb-2">How it works</h3>
        <ol className="space-y-2 text-body text-text-muted list-decimal list-inside">
          <li>Enter text content you&apos;d like to check for safety</li>
          <li>Our NLP model analyzes the content for harmful patterns</li>
          <li>You receive a detailed result with severity, category, confidence, and guidance</li>
          <li>If flagged, the incident may be escalated for human review</li>
        </ol>
      </div>
    </div>
  );
}

export default function AnalyzeTextPage() {
  return (
    <AppLayout>
      <TextAnalysisContent />
    </AppLayout>
  );
}
