import { useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'water_tracking';
const HISTORY_KEY = 'water_tracking_history';

interface WaterTrackingData {
  date: string; // YYYY-MM-DD
  glasses: number;
  timestamps: string[]; // ISO timestamps for each glass
}

interface DailyWaterRecord {
  date: string;
  glasses: number;
  target: number;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

export function useWaterTracking(dailyTarget: number = 8) {
  const [data, setData] = useState<WaterTrackingData>({
    date: getTodayDate(),
    glasses: 0,
    timestamps: [],
  });
  const [history, setHistory] = useState<DailyWaterRecord[]>([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch {
        // Invalid data
      }
    }
    
    if (saved) {
      try {
        const parsed: WaterTrackingData = JSON.parse(saved);
        const today = getTodayDate();
        
        // If it's a new day, save yesterday's data to history and reset
        if (parsed.date !== today) {
          // Save previous day to history
          const newRecord: DailyWaterRecord = {
            date: parsed.date,
            glasses: parsed.glasses,
            target: dailyTarget,
          };
          
          setHistory(prev => {
            // Keep only last 30 days
            const updated = [...prev.filter(r => r.date !== parsed.date), newRecord]
              .sort((a, b) => a.date.localeCompare(b.date))
              .slice(-30);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
            return updated;
          });
          
          setData({
            date: today,
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
  }, [dailyTarget]);

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

  // Weekly data for chart
  const weeklyData = useMemo(() => {
    const last7Days = getLast7Days();
    const today = getTodayDate();
    
    return last7Days.map(date => {
      if (date === today) {
        return {
          date,
          glasses: data.glasses,
          target: dailyTarget,
        };
      }
      const record = history.find(r => r.date === date);
      return {
        date,
        glasses: record?.glasses || 0,
        target: record?.target || dailyTarget,
      };
    });
  }, [data.glasses, history, dailyTarget]);

  // Stats
  const stats = useMemo(() => {
    const totalGlasses = weeklyData.reduce((sum, d) => sum + d.glasses, 0);
    const daysWithData = weeklyData.filter(d => d.glasses > 0).length;
    const daysCompleted = weeklyData.filter(d => d.glasses >= d.target).length;
    const avgGlasses = daysWithData > 0 ? totalGlasses / daysWithData : 0;
    
    // Calculate streak
    let streak = 0;
    for (let i = weeklyData.length - 1; i >= 0; i--) {
      if (weeklyData[i].glasses >= weeklyData[i].target) {
        streak++;
      } else if (weeklyData[i].date !== getTodayDate()) {
        break;
      }
    }

    return {
      totalGlasses,
      avgGlasses: Math.round(avgGlasses * 10) / 10,
      daysCompleted,
      streak,
    };
  }, [weeklyData]);

  return {
    glasses: data.glasses,
    timestamps: data.timestamps,
    addGlass,
    removeGlass,
    resetToday,
    weeklyData,
    stats,
  };
}
