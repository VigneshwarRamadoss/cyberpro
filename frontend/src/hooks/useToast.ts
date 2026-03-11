'use client';

import { useState, useCallback } from 'react';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

let toastId = 0;

const listeners: Set<(toasts: ToastState[]) => void> = new Set();
let currentToasts: ToastState[] = [];

function notify() {
  listeners.forEach((l) => l([...currentToasts]));
}

export function showToast(message: string, type: ToastState['type'] = 'info') {
  const id = String(++toastId);
  currentToasts.push({ id, message, type });
  notify();
  setTimeout(() => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    notify();
  }, 4000);
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const subscribe = useCallback(() => {
    listeners.add(setToasts);
    return () => { listeners.delete(setToasts); };
  }, []);

  return { toasts, subscribe };
}
