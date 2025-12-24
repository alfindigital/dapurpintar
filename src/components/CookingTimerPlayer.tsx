import { useState } from "react";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  X,
  Timer,
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
  timers: TimerItem[];
  stepIndex: number;
  stepLabel: string;
  notificationPermission: NotificationPermission | "unsupported";
  onAddTimer: (stepIndex: number, label: string, minutes: number) => void;
  onRemoveTimer: (id: string) => void;
  onStartTimer: (id: string) => void;
  onPauseTimer: (id: string) => void;
  onResumeTimer: (id: string) => void;
  onResetTimer: (id: string) => void;
  onRequestPermission: () => void;
}

export function CookingTimerPlayer({
  timers,
  stepIndex,
  stepLabel,
  notificationPermission,
  onAddTimer,
  onRemoveTimer,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
  onRequestPermission,
}: CookingTimerPlayerProps) {
  const [minutes, setMinutes] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Get timers for this specific step
  const stepTimers = timers.filter((t) => t.stepIndex === stepIndex);

  const handleAddTimer = () => {
    const mins = parseInt(minutes);
    if (mins > 0 && mins <= 180) {
      onAddTimer(stepIndex, stepLabel.substring(0, 50), mins);
      setMinutes("");
      setIsOpen(false);
    }
  };

  const quickTimers = [1, 5, 15, 30];

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Existing timers for this step */}
      {stepTimers.map((timer) => (
        <div
          key={timer.id}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
            timer.remaining === 0
              ? "bg-destructive/20 text-destructive animate-pulse"
              : timer.isRunning
              ? "bg-primary/20 text-primary"
              : timer.isPaused
              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Timer className="h-3 w-3" />
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
              onClick={() =>
                timer.isPaused ? onResumeTimer(timer.id) : onStartTimer(timer.id)
              }
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
      ))}

      {/* Add timer button - positioned below step number */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs opacity-60 hover:opacity-100 transition-opacity gap-1"
          >
            <Clock className="h-3 w-3" />
            <span>+ Timer</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-2">
            <span className="text-sm font-medium">Set Timer</span>

            {/* Quick timer buttons + custom input in 2 rows max */}
            <div className="flex flex-wrap gap-1 items-center">
              {quickTimers.map((mins) => (
                <Button
                  key={mins}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => {
                    onAddTimer(stepIndex, stepLabel.substring(0, 50), mins);
                    setIsOpen(false);
                  }}
                >
                  {mins}m
                </Button>
              ))}
              <div className="flex gap-1 items-center">
                <Input
                  type="number"
                  placeholder="Custom"
                  min={1}
                  max={180}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="h-7 w-16 text-xs"
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
                  <Timer className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Floating timer summary component
interface FloatingTimerSummaryProps {
  timers: TimerItem[];
  onPauseTimer: (id: string) => void;
  onResumeTimer: (id: string) => void;
  onStartTimer: (id: string) => void;
}

export function FloatingTimerSummary({
  timers,
  onPauseTimer,
  onResumeTimer,
  onStartTimer,
}: FloatingTimerSummaryProps) {
  const activeTimers = timers.filter((t) => t.isRunning || t.isPaused || t.remaining === 0);

  if (activeTimers.length === 0) return null;

  return (
    <div className="fixed bottom-12 right-4 z-50 bg-card border shadow-lg rounded-xl p-3 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Timer Aktif</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {activeTimers.length}
        </Badge>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {activeTimers.map((timer) => (
          <div
            key={timer.id}
            className={`flex items-center justify-between text-xs p-2 rounded-lg ${
              timer.remaining === 0
                ? "bg-destructive/20 text-destructive animate-pulse"
                : timer.isRunning
                ? "bg-primary/10"
                : "bg-muted"
            }`}
          >
            <div className="flex-1 truncate mr-2">
              <span className="font-medium">#{timer.stepIndex + 1}</span>
              <span className="text-muted-foreground ml-1 truncate">
                {timer.label}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono font-bold">
                {formatTime(timer.remaining)}
              </span>
              {timer.isRunning ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => onPauseTimer(timer.id)}
                >
                  <Pause className="h-3 w-3" />
                </Button>
              ) : timer.remaining > 0 ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() =>
                    timer.isPaused ? onResumeTimer(timer.id) : onStartTimer(timer.id)
                  }
                >
                  <Play className="h-3 w-3" />
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
