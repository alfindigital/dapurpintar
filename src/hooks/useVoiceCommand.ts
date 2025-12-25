import { useState, useEffect, useRef, useCallback } from "react";

interface UseVoiceCommandProps {
  onNext: () => void;
  onPrev: () => void;
  onRepeat: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSlower: () => void;
  onFaster: () => void;
  isSpeaking: boolean;
  enabled: boolean;
}

interface UseVoiceCommandReturn {
  isListening: boolean;
  lastCommand: string | null;
  isSupported: boolean;
}

// Command mappings with aliases
const COMMANDS = {
  next: ["lanjut", "next", "lanjutkan", "selanjutnya", "berikutnya"],
  prev: ["mundur", "back", "sebelumnya", "kembali", "balik"],
  repeat: ["ulangi", "repeat", "ulang", "sekali lagi"],
  pause: ["jeda", "pause", "berhenti sebentar"],
  resume: ["lanjutkan", "resume", "teruskan"],
  stop: ["stop", "berhenti", "selesai", "cukup"],
  slower: ["pelan", "lambat", "slower"],
  faster: ["cepat", "faster"],
};

// Fuzzy match function
function matchCommand(transcript: string, keywords: string[]): boolean {
  const normalized = transcript.toLowerCase().trim();
  return keywords.some((keyword) => {
    // Exact match
    if (normalized.includes(keyword)) return true;
    // Fuzzy: allow 1-2 char difference for Indonesian typos
    const words = normalized.split(" ");
    return words.some((word) => {
      if (Math.abs(word.length - keyword.length) > 2) return false;
      let diff = 0;
      for (let i = 0; i < Math.max(word.length, keyword.length); i++) {
        if (word[i] !== keyword[i]) diff++;
        if (diff > 2) return false;
      }
      return true;
    });
  });
}

export function useVoiceCommand({
  onNext,
  onPrev,
  onRepeat,
  onPause,
  onResume,
  onStop,
  onSlower,
  onFaster,
  isSpeaking,
  enabled,
}: UseVoiceCommandProps): UseVoiceCommandReturn {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const wasListeningRef = useRef(false);

  // Check support on mount
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const processCommand = useCallback(
    (transcript: string) => {
      // Check each command type
      if (matchCommand(transcript, COMMANDS.next)) {
        setLastCommand("Lanjut");
        onNext();
        return true;
      }
      if (matchCommand(transcript, COMMANDS.prev)) {
        setLastCommand("Mundur");
        onPrev();
        return true;
      }
      if (matchCommand(transcript, COMMANDS.repeat)) {
        setLastCommand("Ulangi");
        onRepeat();
        return true;
      }
      if (matchCommand(transcript, COMMANDS.stop)) {
        setLastCommand("Stop");
        onStop();
        return true;
      }
      if (matchCommand(transcript, COMMANDS.pause)) {
        setLastCommand("Jeda");
        onPause();
        return true;
      }
      // Check resume after pause (since "lanjutkan" is in both)
      if (matchCommand(transcript, COMMANDS.resume)) {
        setLastCommand("Lanjutkan");
        onResume();
        return true;
      }
      if (matchCommand(transcript, COMMANDS.slower)) {
        setLastCommand("Pelan");
        onSlower();
        return true;
      }
      if (matchCommand(transcript, COMMANDS.faster)) {
        setLastCommand("Cepat");
        onFaster();
        return true;
      }
      return false;
    },
    [onNext, onPrev, onRepeat, onPause, onResume, onStop, onSlower, onFaster]
  );

  // Start/stop recognition based on enabled state
  useEffect(() => {
    if (!isSupported || !enabled) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
        setIsListening(false);
      }
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    const recognition = new SpeechRecognition() as SpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "id-ID";

    (recognition as any).onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if still enabled and not speaking
      if (enabled && !isSpeaking && recognitionRef.current) {
        try {
          recognition.start();
        } catch {
          // Ignore errors on restart
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.warn("Voice command error:", event.error);
      }
    };

    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) {
        const transcript = last[0].transcript;
        processCommand(transcript);
      }
    };

    recognitionRef.current = recognition;

    // Start if not speaking
    if (!isSpeaking) {
      try {
        recognition.start();
      } catch {
        // Already started
      }
    }

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [enabled, isSupported, processCommand]);

  // Pause listening when TTS is speaking
  useEffect(() => {
    if (!recognitionRef.current || !enabled) return;

    if (isSpeaking) {
      wasListeningRef.current = isListening;
      if (isListening) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
    } else if (wasListeningRef.current) {
      // Resume listening after TTS stops
      try {
        recognitionRef.current.start();
      } catch {
        // Already started
      }
    }
  }, [isSpeaking, isListening, enabled]);

  // Clear last command after 2 seconds
  useEffect(() => {
    if (lastCommand) {
      const timer = setTimeout(() => setLastCommand(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastCommand]);

  return {
    isListening,
    lastCommand,
    isSupported,
  };
}
