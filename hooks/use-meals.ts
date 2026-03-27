// Re-export types and hook from the shared context so imports remain stable.
export type { HistoryEntry, Meal } from '@/contexts/meals-context';
export { useMealsContext as useMeals } from '@/contexts/meals-context';

