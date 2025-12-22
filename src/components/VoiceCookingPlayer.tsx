import { Play, Pause, SkipBack, SkipForward, RotateCcw, Square, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface VoiceCookingPlayerProps {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  currentStep: number;
  totalSteps: number;
  rate: number;
  onRateChange: (rate: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRepeat: () => void;
}

export function VoiceCookingPlayer({
  isSupported,
  isSpeaking,
  isPaused,
  currentStep,
  totalSteps,
  rate,
  onRateChange,
  onPlay,
  onPause,
  onResume,
  onStop,
  onNext,
  onPrev,
  onRepeat,
}: VoiceCookingPlayerProps) {
  if (!isSupported) {
    return (
      <div className="p-3 bg-muted/50 rounded-lg text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <VolumeX className="h-4 w-4" />
          <span className="text-sm">Browser tidak mendukung fitur suara</span>
        </div>
      </div>
    );
  }

  const isActive = isSpeaking || isPaused;

  return (
    <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Mode Hands-Free</span>
        </div>
        {isActive && (
          <Badge variant="secondary" className="text-xs">
            Langkah {currentStep + 1} dari {totalSteps}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={onPrev}
          disabled={!isActive || currentStep === 0}
        >
          <SkipBack className="h-5 w-5" />
        </Button>

        {!isActive ? (
          <Button
            variant="default"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={onPlay}
          >
            <Play className="h-6 w-6 ml-0.5" />
          </Button>
        ) : isPaused ? (
          <Button
            variant="default"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={onResume}
          >
            <Play className="h-6 w-6 ml-0.5" />
          </Button>
        ) : (
          <Button
            variant="default"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={onPause}
          >
            <Pause className="h-6 w-6" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={onNext}
          disabled={!isActive || currentStep === totalSteps - 1}
        >
          <SkipForward className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={onRepeat}
          disabled={!isActive}
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={onStop}
          disabled={!isActive}
        >
          <Square className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-16">Kecepatan</span>
        <Slider
          value={[rate]}
          onValueChange={(v) => onRateChange(v[0])}
          min={0.5}
          max={1.5}
          step={0.1}
          className="flex-1"
        />
        <span className="text-xs font-medium w-10 text-right">{rate.toFixed(1)}x</span>
      </div>
    </div>
  );
}
