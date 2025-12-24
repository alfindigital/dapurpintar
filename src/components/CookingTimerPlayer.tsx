import { useState } from "react";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatTime } from "@/hooks/useCookingTimer";

interface TimerItem {
  id: string;
  stepIndex: number;
  label: string;
  duration: number;
  remaining: number;
  isRunning: boolean;
  isPaused: boolean;
}

interface CookingTimerPlayerProps {
  stepIndex: number;
  stepLabel: string;
  hasTimer: boolean;
  timer: TimerItem | null;
  onSetTimer: (stepIndex: number, label: string, minutes: number) => void;
  onPauseTimer: (id: string) => void;
  onResumeTimer: (id: string) => void;
  onResetTimer: (id: string) => void;
  onRemoveTimer: (id: string) => void;
}

export function CookingTimerPlayer({
  stepIndex,
  stepLabel,
  hasTimer,
  timer,
  onSetTimer,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
  onRemoveTimer,
}: CookingTimerPlayerProps) {
  const [minutes, setMinutes] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleAddTimer = () => {
    const mins = parseInt(minutes);
    if (mins > 0 && mins <= 180) {
      onSetTimer(stepIndex, stepLabel, mins);
      setMinutes("");
      setIsOpen(false);
    }
  };

  const handleQuickTimer = (mins: number) => {
    onSetTimer(stepIndex, stepLabel, mins);
    setIsOpen(false);
  };

  const quickTimers = [1, 5, 15, 30];

  // If there's already a timer for this step, show the timer display
  if (hasTimer && timer) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
          timer.remaining === 0
            ? "bg-destructive/20 text-destructive animate-pulse"
            : timer.isRunning
            ? "bg-primary/20 text-primary"
            : timer.isPaused
            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <Clock className="h-3 w-3" />
        <span>{formatTime(timer.remaining)}</span>

        {timer.remaining === 0 ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0"
            onClick={() => onResetTimer(timer.id)}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        ) : timer.isRunning ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0"
            onClick={() => onPauseTimer(timer.id)}
          >
            <Pause className="h-3 w-3" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0"
            onClick={() => onResumeTimer(timer.id)}
          >
            <Play className="h-3 w-3" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0 hover:text-destructive"
          onClick={() => onRemoveTimer(timer.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  // No timer yet - show the add timer button
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-40 hover:opacity-100 transition-opacity"
        >
          <Clock className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="space-y-2">
          <span className="text-sm font-medium">Set Timer</span>

          {/* Quick timer buttons + custom input */}
          <div className="flex gap-1 items-center">
            {quickTimers.map((mins) => (
              <Button
                key={mins}
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => handleQuickTimer(mins)}
              >
                {mins}m
              </Button>
            ))}
            <Input
              type="number"
              placeholder="Menit"
              min={1}
              max={180}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className="h-7 w-20 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTimer();
              }}
            />
            <Button
              size="sm"
              className="h-7 px-2"
              onClick={handleAddTimer}
              disabled={!minutes || parseInt(minutes) <= 0}
            >
              <Play className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Floating timer summary component
interface FloatingTimerSummaryProps {
  timers: TimerItem[];
  onPauseTimer: (id: string) => void;
  onResumeTimer: (id: string) => void;
  onClose: () => void;
}

export function FloatingTimerSummary({
  timers,
  onPauseTimer,
  onResumeTimer,
  onClose,
}: FloatingTimerSummaryProps) {
  // Only show running or paused timers, auto-close when timer finishes (remaining === 0 are excluded)
  const activeTimers = timers.filter((t) => t.isRunning || t.isPaused);

  if (activeTimers.length === 0) return null;

  return (
    <div className="fixed bottom-12 right-4 z-50 bg-card border shadow-lg rounded-xl p-3 max-w-sm">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Timer Aktif</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {activeTimers.length}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 ml-1"
          onClick={onClose}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {activeTimers.map((timer) => (
          <div
            key={timer.id}
            className={`flex items-start gap-2 text-xs p-2 rounded-lg ${
              timer.isRunning ? "bg-primary/10" : "bg-muted"
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                <span className="font-bold text-primary">#{timer.stepIndex + 1}</span>
                <span className="font-mono font-bold">
                  {formatTime(timer.remaining)}
                </span>
              </div>
              {/* Show full instruction text */}
              <p className="text-muted-foreground leading-relaxed">
                {timer.label}
              </p>
            </div>
            <div className="flex-shrink-0">
              {timer.isRunning ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onPauseTimer(timer.id)}
                >
                  <Pause className="h-3 w-3" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onResumeTimer(timer.id)}
                >
                  <Play className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
