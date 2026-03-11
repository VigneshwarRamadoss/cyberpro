'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { analysisApi } from '@/lib/api';
import { showToast } from '@/hooks/useToast';
import { Mic, Upload, X, FileAudio, Square } from 'lucide-react';

function VoiceAnalysisContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setAudioUrl(URL.createObjectURL(selected));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        const audioFile = new File([blob], 'recording.webm', { type: 'audio/webm' });
        setFile(audioFile);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch {
      showToast('Could not access microphone. Please check permissions.', 'error');
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  const clearFile = () => {
    setFile(null);
    setAudioUrl(null);
    if (fileInput.current) fileInput.current.value = '';
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      const res = await analysisApi.analyzeVoice(file);
      showToast('Voice analysis complete', 'success');
      router.push(`/results/${res.data.id}`);
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Voice analysis failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-h1 text-text-primary flex items-center gap-3">
          <Mic className="h-8 w-8 text-accent" />
          Analyze Voice
        </h1>
        <p className="text-body text-text-secondary mt-1">
          Upload an audio file or record a short message. It will be transcribed and analyzed for harmful content.
        </p>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          {/* Upload zone */}
          <div
            onClick={() => !file && fileInput.current?.click()}
            className={`border-2 border-dashed rounded-card p-8 text-center transition-colors cursor-pointer ${
              file ? 'border-primary bg-primary/5' : 'border-border hover:border-text-muted'
            }`}
          >
            <input
              ref={fileInput}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Upload audio file"
            />
            {file ? (
              <div className="space-y-3">
                <FileAudio className="h-10 w-10 text-primary mx-auto" />
                <div>
                  <p className="text-body font-medium text-text-primary">{file.name}</p>
                  <p className="text-caption text-text-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); clearFile(); }}>
                  <X size={14} /> Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="h-10 w-10 text-text-muted mx-auto" />
                <div>
                  <p className="text-body-lg font-medium text-text-primary">Drop audio file or click to upload</p>
                  <p className="text-small text-text-muted">Supported: WAV, MP3, OGG, WebM, FLAC (max 25MB)</p>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-small text-text-muted">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Record */}
          <div className="text-center space-y-3">
            {isRecording ? (
              <Button variant="danger" onClick={stopRecording} size="lg">
                <Square size={18} className="fill-current" />
                Stop Recording
              </Button>
            ) : (
              <Button variant="secondary" onClick={startRecording} size="lg" disabled={!!file}>
                <Mic size={18} />
                Start Recording
              </Button>
            )}
            {isRecording && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse" />
                <span className="text-body text-danger font-medium">Recording...</span>
              </div>
            )}
          </div>

          {/* Preview */}
          {audioUrl && (
            <div className="bg-surface rounded-input p-4 border border-border">
              <p className="text-caption text-text-muted mb-2">Audio Preview</p>
              <audio controls src={audioUrl} className="w-full" />
            </div>
          )}

          {/* Submit */}
          <Button onClick={handleSubmit} className="w-full" size="lg" isLoading={isLoading} disabled={!file}>
            Analyze Voice Content
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function AnalyzeVoicePage() {
  return (
    <AppLayout>
      <VoiceAnalysisContent />
    </AppLayout>
  );
}
