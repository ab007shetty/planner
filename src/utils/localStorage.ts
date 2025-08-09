// localStorage.ts
import { useState, useCallback } from 'react';

export function useMemoryStorage<T>(
  initialValue: T, 
  key: string = 'taskPlannerState'
): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize state with value from localStorage or initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        // Convert date strings back to Date objects for tasks
        if (parsed.tasks) {
          parsed.tasks = parsed.tasks.map((task: any) => ({
            ...task,
            startDate: new Date(task.startDate),
            endDate: new Date(task.endDate)
          }));
        }
        return parsed;
      }
      return initialValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      // Save to localStorage
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [storedValue, key]);

  return [storedValue, setValue];
}