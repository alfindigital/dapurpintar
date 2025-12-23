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
  addTimer: (stepIndex: number, label: string, minutes: number) => void;
  removeTimer: (id: string) => void;
  startTimer: (id: string) => void;
  pauseTimer: (id: string) => void;
  resumeTimer: (id: string) => void;
  resetTimer: (id: string) => void;
  clearAllTimers: () => void;
  notificationPermission: NotificationPermission | "unsupported";
  requestNotificationPermission: () => Promise<void>;
}

export function useCookingTimer(): UseCookingTimerReturn {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("default");
  const intervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

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
    
    // Also play a sound if available
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleRs/BK/RoWkjDACU0LSJSjQGAJXPoHhEOw+s1KmTY0cpG6fa0q17RDkXnN/bs35COB+e4d+ufl1AOhik5Ny9dEIfE5nb1bJ8Tj4knOLdyYZWPAur6OTNi1xCDajk4sqGWkQXq+fmzoVZRQCq5ebNg1lFAKrl5s2DWUUC");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {
      // Audio not available
    }
  }, []);

  const addTimer = useCallback((stepIndex: number, label: string, minutes: number) => {
    const id = `timer-${Date.now()}-${stepIndex}`;
    const duration = minutes * 60;
    
    setTimers((prev) => [
      ...prev,
      {
        id,
        stepIndex,
        label,
        duration,
        remaining: duration,
        isRunning: false,
        isPaused: false,
      },
    ]);

    // Request notification permission when first timer is added
    if (notificationPermission === "default") {
      requestNotificationPermission();
    }
  }, [notificationPermission, requestNotificationPermission]);

  const removeTimer = useCallback((id: string) => {
    const interval = intervalsRef.current.get(id);
    if (interval) {
      clearInterval(interval);
      intervalsRef.current.delete(id);
    }
    setTimers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const startTimer = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, isRunning: true, isPaused: false } : t
      )
    );

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
          return prev.map((t) =>
            t.id === id ? { ...t, remaining: 0, isRunning: false } : t
          );
        }

        return prev.map((t) =>
          t.id === id ? { ...t, remaining: t.remaining - 1 } : t
        );
      });
    }, 1000);

    intervalsRef.current.set(id, interval);
  }, [showNotification]);

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
    startTimer(id);
  }, [startTimer]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intervalsRef.current.forEach((interval) => clearInterval(interval));
    };
  }, []);

  return {
    timers,
    addTimer,
    removeTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    clearAllTimers,
    notificationPermission,
    requestNotificationPermission,
  };
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
