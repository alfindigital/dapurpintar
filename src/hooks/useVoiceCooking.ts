import { useState, useCallback, useRef, useEffect } from "react";

interface UseVoiceCookingProps {
  steps: string[];
  onStepChange?: (stepIndex: number) => void;
}

interface UseVoiceCookingReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  currentStep: number;
  rate: number;
  setRate: (rate: number) => void;
  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  nextStep: () => void;
  prevStep: () => void;
  repeatStep: () => void;
  goToStep: (index: number) => void;
}

export function useVoiceCooking({ steps, onStepChange }: UseVoiceCookingProps): UseVoiceCookingReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [rate, setRate] = useState(0.9);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported("speechSynthesis" in window);
  }, []);

  const speak = useCallback((text: string, stepIndex: number) => {
    if (!isSupported) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = rate;
    utterance.pitch = 1;

    // Try to find Indonesian voice
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find(v => v.lang.startsWith("id"));
    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      
      // Auto-advance to next step
      if (stepIndex < steps.length - 1) {
        const nextIndex = stepIndex + 1;
        setCurrentStep(nextIndex);
        onStepChange?.(nextIndex);
        // Small delay before reading next step
        setTimeout(() => {
          speak(`Langkah ${nextIndex + 1}. ${steps[nextIndex]}`, nextIndex);
        }, 800);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, rate, steps, onStepChange]);

  const play = useCallback(() => {
    if (!isSupported || steps.length === 0) return;
    
    setCurrentStep(0);
    onStepChange?.(0);
    speak(`Langkah 1. ${steps[0]}`, 0);
  }, [isSupported, steps, speak, onStepChange]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentStep(0);
    onStepChange?.(0);
  }, [isSupported, onStepChange]);

  const goToStep = useCallback((index: number) => {
    if (!isSupported || index < 0 || index >= steps.length) return;
    
    window.speechSynthesis.cancel();
    setCurrentStep(index);
    onStepChange?.(index);
    speak(`Langkah ${index + 1}. ${steps[index]}`, index);
  }, [isSupported, steps, speak, onStepChange]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, steps.length, goToStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const repeatStep = useCallback(() => {
    goToStep(currentStep);
  }, [currentStep, goToStep]);

  // Update rate while speaking
  useEffect(() => {
    if (utteranceRef.current) {
      utteranceRef.current.rate = rate;
    }
  }, [rate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    currentStep,
    rate,
    setRate,
    play,
    pause,
    resume,
    stop,
    nextStep,
    prevStep,
    repeatStep,
    goToStep,
  };
}
