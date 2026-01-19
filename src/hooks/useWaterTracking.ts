import { useState, useEffect, useCallback, useMemo } from 'react';
import { checkAchievements, Achievement } from '@/lib/waterAchievements';
import { toast } from 'sonner';

const STORAGE_KEY = 'water_tracking';
const HISTORY_KEY = 'water_tracking_history';
const ACHIEVEMENTS_KEY = 'water_achievements';
const TOTAL_GLASSES_KEY = 'water_total_glasses';

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

// Validation functions
function isValidWaterTrackingData(data: unknown): data is WaterTrackingData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.date === 'string' &&
    typeof d.glasses === 'number' &&
    Array.isArray(d.timestamps) &&
    d.timestamps.every(t => typeof t === 'string')
  );
}

function isValidDailyWaterRecord(record: unknown): record is DailyWaterRecord {
  if (!record || typeof record !== 'object') return false;
  const r = record as Record<string, unknown>;
  return (
    typeof r.date === 'string' &&
    typeof r.glasses === 'number' &&
    typeof r.target === 'number'
  );
}

function isValidStringArray(arr: unknown): arr is string[] {
  return Array.isArray(arr) && arr.every(item => typeof item === 'string');
}

// Safe loaders
function safeLoadWaterData(): WaterTrackingData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return isValidWaterTrackingData(parsed) ? parsed : null;
  } catch {
    console.warn('Failed to parse water tracking data');
    return null;
  }
}

function safeLoadHistory(): DailyWaterRecord[] {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidDailyWaterRecord);
  } catch {
    console.warn('Failed to parse water history');
    return [];
  }
}

function safeLoadAchievements(): string[] {
  try {
    const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return isValidStringArray(parsed) ? parsed : [];
  } catch {
    console.warn('Failed to parse water achievements');
    return [];
  }
}

function safeLoadTotalGlasses(): number {
  try {
    const saved = localStorage.getItem(TOTAL_GLASSES_KEY);
    if (!saved) return 0;
    const num = parseInt(saved, 10);
    return isNaN(num) ? 0 : num;
  } catch {
    return 0;
  }
}

export function useWaterTracking(dailyTarget: number = 8) {
  const [data, setData] = useState<WaterTrackingData>({
    date: getTodayDate(),
    glasses: 0,
    timestamps: [],
  });
  const [history, setHistory] = useState<DailyWaterRecord[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [totalGlassesAllTime, setTotalGlassesAllTime] = useState(0);

  // Load from localStorage with validation
  useEffect(() => {
    const savedAchievements = safeLoadAchievements();
    setUnlockedAchievements(savedAchievements);
    
    const savedTotal = safeLoadTotalGlasses();
    setTotalGlassesAllTime(savedTotal);
    
    const savedHistory = safeLoadHistory();
    setHistory(savedHistory);
    
    const savedData = safeLoadWaterData();
    if (savedData) {
      const today = getTodayDate();
      
      // If it's a new day, save yesterday's data to history and reset
      if (savedData.date !== today) {
        const newRecord: DailyWaterRecord = {
          date: savedData.date,
          glasses: savedData.glasses,
          target: dailyTarget,
        };
        
        setHistory(prev => {
          const updated = [...prev.filter(r => r.date !== savedData.date), newRecord]
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
        setData(savedData);
      }
    }
  }, [dailyTarget]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Save achievements to localStorage
  useEffect(() => {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlockedAchievements));
  }, [unlockedAchievements]);

  // Save total glasses
  useEffect(() => {
    localStorage.setItem(TOTAL_GLASSES_KEY, String(totalGlassesAllTime));
  }, [totalGlassesAllTime]);

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
    
    // Calculate streak from history + today
    const allDays = [...history, { date: getTodayDate(), glasses: data.glasses, target: dailyTarget }]
      .sort((a, b) => b.date.localeCompare(a.date));
    
    let streak = 0;
    for (let i = 0; i < allDays.length; i++) {
      if (allDays[i].glasses >= allDays[i].target) {
        streak++;
      } else if (allDays[i].date !== getTodayDate()) {
        break;
      }
    }

    return {
      totalGlasses,
      avgGlasses: Math.round(avgGlasses * 10) / 10,
      daysCompleted,
      streak,
    };
  }, [weeklyData, history, data.glasses, dailyTarget]);

  // Check for new achievements
  const checkNewAchievements = useCallback((newGlasses: number, newTotal: number) => {
    const daysCompletedThisWeek = weeklyData.filter(d => d.glasses >= d.target).length + 
      (newGlasses >= dailyTarget && data.glasses < dailyTarget ? 1 : 0);
    
    const newlyUnlocked = checkAchievements(
      stats.streak + (newGlasses >= dailyTarget && data.glasses < dailyTarget ? 1 : 0),
      newTotal,
      newGlasses,
      dailyTarget,
      daysCompletedThisWeek,
      unlockedAchievements
    );

    if (newlyUnlocked.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newlyUnlocked.map(a => a.id)]);
      newlyUnlocked.forEach(achievement => {
        toast.success(`🏆 Achievement: ${achievement.name}!`, {
          description: achievement.description,
          duration: 4000,
        });
      });
    }
  }, [stats.streak, dailyTarget, unlockedAchievements, weeklyData, data.glasses]);

  const addGlass = useCallback(() => {
    const newGlasses = data.glasses + 1;
    const newTotal = totalGlassesAllTime + 1;
    
    setData(prev => ({
      ...prev,
      glasses: newGlasses,
      timestamps: [...prev.timestamps, new Date().toISOString()],
    }));
    setTotalGlassesAllTime(newTotal);
    
    // Check achievements after adding
    setTimeout(() => checkNewAchievements(newGlasses, newTotal), 100);
  }, [data.glasses, totalGlassesAllTime, checkNewAchievements]);

  const removeGlass = useCallback(() => {
    if (data.glasses > 0) {
      setData(prev => ({
        ...prev,
        glasses: prev.glasses - 1,
        timestamps: prev.timestamps.slice(0, -1),
      }));
      setTotalGlassesAllTime(prev => Math.max(0, prev - 1));
    }
  }, [data.glasses]);

  const resetToday = useCallback(() => {
    const glassesToRemove = data.glasses;
    setData({
      date: getTodayDate(),
      glasses: 0,
      timestamps: [],
    });
    setTotalGlassesAllTime(prev => Math.max(0, prev - glassesToRemove));
  }, [data.glasses]);

  return {
    glasses: data.glasses,
    timestamps: data.timestamps,
    addGlass,
    removeGlass,
    resetToday,
    weeklyData,
    stats,
    unlockedAchievements,
    totalGlassesAllTime,
  };
}
