import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'water_tracking';

interface WaterTrackingData {
  date: string; // YYYY-MM-DD
  glasses: number;
  timestamps: string[]; // ISO timestamps for each glass
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function useWaterTracking() {
  const [data, setData] = useState<WaterTrackingData>({
    date: getTodayDate(),
    glasses: 0,
    timestamps: [],
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: WaterTrackingData = JSON.parse(saved);
        // Reset if it's a new day
        if (parsed.date !== getTodayDate()) {
          setData({
            date: getTodayDate(),
            glasses: 0,
            timestamps: [],
          });
        } else {
          setData(parsed);
        }
      } catch {
        // Invalid data, reset
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addGlass = useCallback(() => {
    setData(prev => ({
      ...prev,
      glasses: prev.glasses + 1,
      timestamps: [...prev.timestamps, new Date().toISOString()],
    }));
  }, []);

  const removeGlass = useCallback(() => {
    setData(prev => ({
      ...prev,
      glasses: Math.max(0, prev.glasses - 1),
      timestamps: prev.timestamps.slice(0, -1),
    }));
  }, []);

  const resetToday = useCallback(() => {
    setData({
      date: getTodayDate(),
      glasses: 0,
      timestamps: [],
    });
  }, []);

  return {
    glasses: data.glasses,
    timestamps: data.timestamps,
    addGlass,
    removeGlass,
    resetToday,
  };
}
