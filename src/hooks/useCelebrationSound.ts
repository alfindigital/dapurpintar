import { useCallback, useRef } from "react";

type NoteFrequency = number;
type NoteDuration = number;
type NoteDelay = number;

// Celebration melody notes [frequency, duration, delay]
const CELEBRATION_MELODY: [NoteFrequency, NoteDuration, NoteDelay][] = [
  // Fanfare opening
  [523.25, 0.15, 0],     // C5
  [659.25, 0.15, 0.12],  // E5
  [783.99, 0.15, 0.24],  // G5
  [1046.50, 0.3, 0.36],  // C6 (hold)
  
  // Sparkle accent
  [1318.51, 0.1, 0.7],   // E6
  [1567.98, 0.1, 0.8],   // G6
  [2093.00, 0.15, 0.9],  // C7
  
  // Final chord
  [1046.50, 0.4, 1.1],   // C6
  [1318.51, 0.4, 1.1],   // E6
  [1567.98, 0.4, 1.1],   // G6
];

export const useCelebrationSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playNote = useCallback((
    ctx: AudioContext,
    frequency: number,
    duration: number,
    startTime: number,
    type: OscillatorType = "sine"
  ) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    
    // Envelope for smoother sound
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.1);
  }, []);

  const playCelebrationSound = useCallback(() => {
    try {
      // Create or resume audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      
      // Resume if suspended (browser autoplay policy)
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
      const now = ctx.currentTime;
      
      // Play the celebration melody
      CELEBRATION_MELODY.forEach(([freq, dur, delay]) => {
        playNote(ctx, freq, dur, now + delay, "sine");
      });
      
      // Add shimmer effect
      for (let i = 0; i < 5; i++) {
        const shimmerFreq = 2000 + Math.random() * 2000;
        const shimmerDelay = 0.5 + Math.random() * 1;
        playNote(ctx, shimmerFreq, 0.05, now + shimmerDelay, "sine");
      }
      
    } catch (error) {
      console.warn("Could not play celebration sound:", error);
    }
  }, [playNote]);

  return { playCelebrationSound };
};
