'use client';

// Typed generic wrapper around localStorage that handles SSR safely
export const getStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

export const setStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
  }
};

export const removeStorage = (key: string): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Error removing localStorage key "${key}":`, error);
  }
};

export const clearStorage = (): void => {
  if (typeof window === 'undefined') return;
  try {
    // Only clear our app's keys, or clear everything if we don't care
    const keysToClear = [
      'shieldspeak_auth',
      'shieldspeak_users',
      'shieldspeak_analyses',
      'shieldspeak_incidents',
      'shieldspeak_admin_reviews',
      'shieldspeak_preferences',
      'shieldspeak_seeded'
    ];
    keysToClear.forEach(key => window.localStorage.removeItem(key));
  } catch (error) {
    console.warn('Error clearing localStorage:', error);
  }
};
