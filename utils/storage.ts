
import { useState, useEffect } from 'react';

/**
 * A hook that synchronizes state with localStorage.
 * Automatically hydrates on mount and persists on update.
 */
export function usePersistentState<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize state from localStorage or fallback to initialValue
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error writing to localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

/**
 * Utility to clear specific Kairo keys (for resets)
 */
export const clearKairoStorage = () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('kairo_')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
};
