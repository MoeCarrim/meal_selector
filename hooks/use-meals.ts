import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface Meal {
  id: string;
  name: string;
}

export interface HistoryEntry {
  mealId: string;
  mealName: string;
  selectedAt: number; // timestamp in ms
}

const STORAGE_KEYS = {
  MEALS: 'iftaar_meals',
  HISTORY: 'iftaar_history',
  EXCLUSION_DAYS: 'iftaar_exclusion_days',
};

const DEFAULT_EXCLUSION_DAYS = 3;

export function useMeals() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [exclusionDays, setExclusionDays] = useState<number>(DEFAULT_EXCLUSION_DAYS);
  const [loading, setLoading] = useState(true);

  // Load all data from storage on mount
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
        if (daysStr !== null) setExclusionDays(Number(daysStr));
      } catch {
        // ignore storage errors
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const saveMeals = useCallback(async (updated: Meal[]) => {
    setMeals(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(updated));
  }, []);

  const saveHistory = useCallback(async (updated: HistoryEntry[]) => {
    setHistory(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  }, []);

  const addMeal = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const newMeal: Meal = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: trimmed,
      };
      await saveMeals([...meals, newMeal]);
    },
    [meals, saveMeals],
  );

  const removeMeal = useCallback(
    async (id: string) => {
      await saveMeals(meals.filter((m) => m.id !== id));
    },
    [meals, saveMeals],
  );

  const recordSelection = useCallback(
    async (meal: Meal) => {
      const entry: HistoryEntry = {
        mealId: meal.id,
        mealName: meal.name,
        selectedAt: Date.now(),
      };
      await saveHistory([entry, ...history]);
    },
    [history, saveHistory],
  );

  const clearHistory = useCallback(async () => {
    await saveHistory([]);
  }, [saveHistory]);

  const updateExclusionDays = useCallback(async (days: number) => {
    setExclusionDays(days);
    await AsyncStorage.setItem(STORAGE_KEYS.EXCLUSION_DAYS, String(days));
  }, []);

  // Meals that are NOT excluded by recent history
  const availableMeals = meals.filter((meal) => {
    const cutoff = Date.now() - exclusionDays * 24 * 60 * 60 * 1000;
    const recentEntry = history.find(
      (h) => h.mealId === meal.id && h.selectedAt >= cutoff,
    );
    return !recentEntry;
  });

  return {
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
  };
}
