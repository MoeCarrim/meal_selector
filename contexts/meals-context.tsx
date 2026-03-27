import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface Meal {
  id: string;
  name: string;
}

export interface HistoryEntry {
  mealId: string;
  mealName: string;
  selectedAt: number; // timestamp in ms
}

interface MealsContextValue {
  meals: Meal[];
  history: HistoryEntry[];
  exclusionDays: number;
  loading: boolean;
  availableMeals: Meal[];
  addMeal: (name: string) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
  recordSelection: (meal: Meal) => Promise<void>;
  clearHistory: () => Promise<void>;
  updateExclusionDays: (days: number) => Promise<void>;
}

const MealsContext = createContext<MealsContextValue | null>(null);

const STORAGE_KEYS = {
  MEALS: 'iftaar_meals',
  HISTORY: 'iftaar_history',
  EXCLUSION_DAYS: 'iftaar_exclusion_days',
};

const DEFAULT_EXCLUSION_DAYS = 3;
const MIN_EXCLUSION_DAYS = 1;
const MAX_EXCLUSION_DAYS = 30;

export function MealsProvider({ children }: { children: React.ReactNode }) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [exclusionDays, setExclusionDays] = useState<number>(DEFAULT_EXCLUSION_DAYS);
  const [loading, setLoading] = useState(true);

  // Load all data from storage once on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [mealsJson, historyJson, daysStr] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.MEALS),
          AsyncStorage.getItem(STORAGE_KEYS.HISTORY),
          AsyncStorage.getItem(STORAGE_KEYS.EXCLUSION_DAYS),
        ]);
        if (mealsJson) setMeals(JSON.parse(mealsJson));
        if (historyJson) setHistory(JSON.parse(historyJson));
        if (daysStr !== null) {
          const parsed = Number(daysStr);
          // Validate: must be a finite number within acceptable range
          const valid =
            Number.isFinite(parsed) &&
            parsed >= MIN_EXCLUSION_DAYS &&
            parsed <= MAX_EXCLUSION_DAYS;
          setExclusionDays(valid ? parsed : DEFAULT_EXCLUSION_DAYS);
        }
      } catch {
        // ignore storage errors – app continues with defaults
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Use functional setState so mutations are never based on stale closure values.
  // Storage writes inside the updater are intentionally fire-and-forget to avoid
  // blocking the synchronous state update; rejections are caught and silenced.
  const addMeal = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newMeal: Meal = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: trimmed,
    };
    setMeals((prev) => {
      const next = [...prev, newMeal];
      AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const removeMeal = useCallback(async (id: string) => {
    setMeals((prev) => {
      const next = prev.filter((m) => m.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const recordSelection = useCallback(async (meal: Meal) => {
    const entry: HistoryEntry = {
      mealId: meal.id,
      mealName: meal.name,
      selectedAt: Date.now(),
    };
    setHistory((prev) => {
      const next = [entry, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
  }, []);

  const updateExclusionDays = useCallback(async (days: number) => {
    setExclusionDays(days);
    await AsyncStorage.setItem(STORAGE_KEYS.EXCLUSION_DAYS, String(days));
  }, []);

  // Meals not excluded by the recent history window
  const availableMeals = meals.filter((meal) => {
    const cutoff = Date.now() - exclusionDays * 24 * 60 * 60 * 1000;
    return !history.find((h) => h.mealId === meal.id && h.selectedAt >= cutoff);
  });

  return (
    <MealsContext.Provider
      value={{
        meals,
        history,
        exclusionDays,
        loading,
        availableMeals,
        addMeal,
        removeMeal,
        recordSelection,
        clearHistory,
        updateExclusionDays,
      }}
    >
      {children}
    </MealsContext.Provider>
  );
}

export function useMealsContext(): MealsContextValue {
  const ctx = useContext(MealsContext);
  if (!ctx) throw new Error('useMealsContext must be used within <MealsProvider>');
  return ctx;
}
