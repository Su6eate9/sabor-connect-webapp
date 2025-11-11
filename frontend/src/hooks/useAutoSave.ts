import { useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';

interface AutoSaveOptions {
  key: string;
  debounceMs?: number;
  enabled?: boolean;
}

export const useAutoSave = <T>(
  data: T,
  { key, debounceMs = 2000, enabled = true }: AutoSaveOptions
) => {
  const debouncedData = useDebounce(data, debounceMs);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip first render to avoid overwriting with initial empty state
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled) return;

    try {
      localStorage.setItem(key, JSON.stringify(debouncedData));
      console.log(`[AutoSave] Draft saved: ${key}`);
    } catch (error) {
      console.error('[AutoSave] Failed to save draft:', error);
    }
  }, [debouncedData, key, enabled]);

  const loadDraft = (): T | null => {
    try {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        return JSON.parse(savedData) as T;
      }
    } catch (error) {
      console.error('[AutoSave] Failed to load draft:', error);
    }
    return null;
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(key);
      console.log(`[AutoSave] Draft cleared: ${key}`);
    } catch (error) {
      console.error('[AutoSave] Failed to clear draft:', error);
    }
  };

  return { loadDraft, clearDraft };
};
