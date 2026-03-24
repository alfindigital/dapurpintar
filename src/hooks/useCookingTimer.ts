import { useState, useEffect, useRef, useCallback } from "react";

interface Timer {
  id: string;
  stepIndex: number;
  label: string;
  duration: number; // in seconds
  remaining: number; // in seconds
  isRunning: boolean;
  isPaused: boolean;
}

interface UseCookingTimerReturn {
  timers: Timer[];
  setTimer: (stepIndex: number, label: string, minutes: number) => void;
  removeTimer: (id: string) => void;
  pauseTimer: (id: string) => void;
  resumeTimer: (id: string) => void;
  resetTimer: (id: string) => void;
  clearAllTimers: () => void;
  getTimerForStep: (stepIndex: number) => Timer | null;
  notificationPermission: NotificationPermission | "unsupported";
  requestNotificationPermission: () => Promise<void>;
}

export function useCookingTimer(): UseCookingTimerReturn {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("default");
  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  // Check notification support and permission
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    } else {
      setNotificationPermission("unsupported");
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  }, []);

  const showNotification = useCallback((title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "🍳",
        tag: "cooking-timer",
        requireInteraction: true,
      });
    }
    
    // Play ringing alarm sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a "kriiingg" ringing sound pattern
      const playRing = (startTime: number) => {
        // High frequency ring
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Two oscillators for richer ring sound
        osc1.frequency.value = 1200;
        osc2.frequency.value = 1500;
        osc1.type = 'sine';
        osc2.type = 'sine';
        
        // Tremolo effect for ringing
        gainNode.gain.setValueAtTime(0.3, startTime);
        for (let i = 0; i < 10; i++) {
          gainNode.gain.setValueAtTime(0.3, startTime + i * 0.05);
          gainNode.gain.setValueAtTime(0.1, startTime + i * 0.05 + 0.025);
        }
        gainNode.gain.setValueAtTime(0, startTime + 0.5);
        
        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(startTime + 0.5);
        osc2.stop(startTime + 0.5);
      };
      
      // Play 3 rings
      const now = audioContext.currentTime;
      playRing(now);
      playRing(now + 0.6);
      playRing(now + 1.2);
    } catch {
      // Audio not available
    }
  }, []);

  const startTimerInterval = useCallback((id: string) => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const timer = prev.find((t) => t.id === id);
        if (!timer || !timer.isRunning || timer.isPaused) return prev;

        if (timer.remaining <= 1) {
          // Timer complete
          clearInterval(interval);
          intervalsRef.current.delete(id);
          showNotification(
            "⏰ Timer Selesai!",
            `Langkah ${timer.stepIndex + 1}: ${timer.label}`
          );
          // Remove the timer when it completes
          return prev.filter((t) => t.id !== id);
        }

        return prev.map((t) =>
          t.id === id ? { ...t, remaining: t.remaining - 1 } : t
        );
      });
    }, 1000);

    intervalsRef.current.set(id, interval);
  }, [showNotification]);

  // Set timer for a step (replaces any existing timer for that step) and starts immediately
  const setTimer = useCallback((stepIndex: number, label: string, minutes: number) => {
    // Remove any existing timer for this step
    setTimers((prev) => {
      const existing = prev.find((t) => t.stepIndex === stepIndex);
      if (existing) {
        const interval = intervalsRef.current.get(existing.id);
        if (interval) {
          clearInterval(interval);
          intervalsRef.current.delete(existing.id);
        }
      }
      return prev.filter((t) => t.stepIndex !== stepIndex);
    });

    const id = `timer-${Date.now()}-${stepIndex}`;
    const duration = minutes * 60;
    
    // Add new timer and start it immediately
    setTimers((prev) => [
      ...prev,
      {
        id,
        stepIndex,
        label,
        duration,
        remaining: duration,
        isRunning: true,
        isPaused: false,
      },
    ]);

    // Start the interval
    setTimeout(() => startTimerInterval(id), 0);

    // Request notification permission when first timer is added
    if (notificationPermission === "default") {
      requestNotificationPermission();
    }
  }, [notificationPermission, requestNotificationPermission, startTimerInterval]);

  const removeTimer = useCallback((id: string) => {
    const interval = intervalsRef.current.get(id);
    if (interval) {
      clearInterval(interval);
      intervalsRef.current.delete(id);
    }
    setTimers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pauseTimer = useCallback((id: string) => {
    const interval = intervalsRef.current.get(id);
    if (interval) {
      clearInterval(interval);
      intervalsRef.current.delete(id);
    }
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, isRunning: false, isPaused: true } : t
      )
    );
  }, []);

  const resumeTimer = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, isRunning: true, isPaused: false } : t
      )
    );
    startTimerInterval(id);
  }, [startTimerInterval]);

  const resetTimer = useCallback((id: string) => {
    const interval = intervalsRef.current.get(id);
    if (interval) {
      clearInterval(interval);
      intervalsRef.current.delete(id);
    }
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, remaining: t.duration, isRunning: false, isPaused: false }
          : t
      )
    );
  }, []);

  const clearAllTimers = useCallback(() => {
    intervalsRef.current.forEach((interval) => clearInterval(interval));
    intervalsRef.current.clear();
    setTimers([]);
  }, []);

  const getTimerForStep = useCallback((stepIndex: number): Timer | null => {
    return timers.find((t) => t.stepIndex === stepIndex) || null;
  }, [timers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intervalsRef.current.forEach((interval) => clearInterval(interval));
    };
  }, []);

  return {
    timers,
    setTimer,
    removeTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    clearAllTimers,
    getTimerForStep,
    notificationPermission,
    requestNotificationPermission,
  };
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
