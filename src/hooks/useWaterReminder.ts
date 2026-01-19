import { useState, useEffect, useCallback, useRef } from 'react';

const REMINDER_SETTINGS_KEY = 'water_reminder_settings';

export interface ReminderSettings {
  enabled: boolean;
  intervalMinutes: number;
  startHour: number;
  endHour: number;
  sound: boolean;
}

const defaultSettings: ReminderSettings = {
  enabled: false,
  intervalMinutes: 60,
  startHour: 8,
  endHour: 22,
  sound: true,
};

// Validation function
function isValidReminderSettings(data: unknown): data is ReminderSettings {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.enabled === 'boolean' &&
    typeof d.intervalMinutes === 'number' &&
    typeof d.startHour === 'number' &&
    typeof d.endHour === 'number' &&
    typeof d.sound === 'boolean'
  );
}

// Safe loader
function safeLoadReminderSettings(): ReminderSettings {
  try {
    const saved = localStorage.getItem(REMINDER_SETTINGS_KEY);
    if (!saved) return defaultSettings;
    const parsed = JSON.parse(saved);
    if (!isValidReminderSettings(parsed)) return defaultSettings;
    return { ...defaultSettings, ...parsed };
  } catch {
    console.warn('Failed to parse reminder settings');
    return defaultSettings;
  }
}

export const useWaterReminder = () => {
  const [settings, setSettings] = useState<ReminderSettings>(() => safeLoadReminderSettings());
  
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [lastReminder, setLastReminder] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return 'denied';
    }
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    return permission;
  }, []);

  // Check if current time is within active hours
  const isWithinActiveHours = useCallback(() => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= settings.startHour && hour < settings.endHour;
  }, [settings.startHour, settings.endHour]);

  // Send notification
  const sendNotification = useCallback(() => {
    if (permissionStatus !== 'granted' || !isWithinActiveHours()) return;

    const messages = [
      '💧 Waktunya minum air! Tetap terhidrasi ya!',
      '🥤 Jangan lupa minum air putih!',
      '💦 Sudah minum air hari ini? Yuk minum sekarang!',
      '🌊 Reminder: Minum segelas air untuk kesehatanmu!',
      '💧 Tubuhmu butuh air! Ayo minum sekarang!',
    ];
    
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    const notification = new Notification('Pengingat Minum Air', {
      body: message,
      icon: '/favicon.ico',
      tag: 'water-reminder',
    });

    if (settings.sound) {
      // Play a simple beep sound
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (e) {
        console.log('Audio not supported');
      }
    }

    setLastReminder(new Date());

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }, [permissionStatus, isWithinActiveHours, settings.sound]);

  // Set up reminder interval
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (settings.enabled && permissionStatus === 'granted') {
      intervalRef.current = setInterval(() => {
        sendNotification();
      }, settings.intervalMinutes * 60 * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [settings.enabled, settings.intervalMinutes, permissionStatus, sendNotification]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<ReminderSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Toggle reminder
  const toggleReminder = useCallback(async () => {
    if (!settings.enabled) {
      if (permissionStatus !== 'granted') {
        const permission = await requestPermission();
        if (permission !== 'granted') {
          return false;
        }
      }
      updateSettings({ enabled: true });
      return true;
    } else {
      updateSettings({ enabled: false });
      return true;
    }
  }, [settings.enabled, permissionStatus, requestPermission, updateSettings]);

  // Test notification
  const testNotification = useCallback(() => {
    if (permissionStatus === 'granted') {
      sendNotification();
    }
  }, [permissionStatus, sendNotification]);

  return {
    settings,
    updateSettings,
    toggleReminder,
    testNotification,
    permissionStatus,
    requestPermission,
    lastReminder,
    isSupported: 'Notification' in window,
  };
};
