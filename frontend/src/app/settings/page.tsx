'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import { showToast } from '@/hooks/useToast';
import { db } from '@/lib/demo-db';
import { Settings as SettingsIcon, User, Lock, Bell, AlertTriangle } from 'lucide-react';

function SettingsContent() {
  const { user } = useAuthStore();
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handlePwChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 8) { showToast('Password must be at least 8 characters', 'error'); return; }
    setPwLoading(true);
    try {
      await authApi.updatePassword({ current_password: currentPw, new_password: newPw });
      showToast('Password updated successfully', 'success');
      setCurrentPw(''); setNewPw('');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Failed to update password', 'error');
    } finally { setPwLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-h1 text-text-primary flex items-center gap-3"><SettingsIcon className="h-8 w-8 text-text-muted" /> Settings</h1>

      <Card>
        <CardHeader title="Profile Information" />
        <div className="space-y-4">
          <div><p className="text-caption text-text-muted">Full Name</p><p className="text-body-lg text-text-primary">{user?.full_name}</p></div>
          <div><p className="text-caption text-text-muted">Email</p><p className="text-body-lg text-text-primary">{user?.email}</p></div>
          <div><p className="text-caption text-text-muted">Role</p><p className="text-body-lg text-text-primary capitalize">{user?.role}</p></div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Change Password" />
        <form onSubmit={handlePwChange} className="space-y-4">
          <Input label="Current Password" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
          <Input label="New Password" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} helperText="Minimum 8 characters" />
          <Button type="submit" isLoading={pwLoading}><Lock size={16} /> Update Password</Button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Notification Preferences" />
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
            <span className="text-body text-text-secondary">Email me about flagged content</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
            <span className="text-body text-text-secondary">Weekly safety summary</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-primary" />
            <span className="text-body text-text-secondary">Product updates and tips</span>
          </label>
        </div>
      </Card>

      <Card className="border-danger/20">
        <CardHeader title="Hackathon MVP" />
        <div className="space-y-4">
          <p className="text-body text-text-secondary">
            Since this is running as a frontend-only MVP, all data is stored locally in your browser. 
            You can reset the demo data (users, incidents, analyses) to start fresh.
          </p>
          <Button variant="danger" onClick={() => { db.reset(); }}><AlertTriangle size={16} /> Reset Demo Data</Button>
        </div>
      </Card>
    </div>
  );
}

export default function SettingsPage() { return <AppLayout><SettingsContent /></AppLayout>; }
