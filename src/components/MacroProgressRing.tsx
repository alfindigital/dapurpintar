interface MacroProgressRingProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
  size?: number;
}

export function MacroProgressRing({ 
  value, 
  max, 
  label, 
  unit, 
  color,
  size = 64 
}: MacroProgressRingProps) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-muted/30"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold leading-none">{value}</span>
          <span className="text-[10px] text-muted-foreground">{unit}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

interface MacroRingsProps {
  kalori: number;
  protein: number;
  karbohidrat: number;
  lemak: number;
}

export function MacroRings({ kalori, protein, karbohidrat, lemak }: MacroRingsProps) {
  return (
    <div className="grid grid-cols-4 gap-2 p-3 bg-muted/50 rounded-lg">
      <MacroProgressRing
        value={kalori}
        max={800}
        label="Kalori"
        unit="kkal"
        color="hsl(24, 95%, 53%)"
      />
      <MacroProgressRing
        value={protein}
        max={50}
        label="Protein"
        unit="g"
        color="hsl(0, 72%, 51%)"
      />
      <MacroProgressRing
        value={karbohidrat}
        max={100}
        label="Karbo"
        unit="g"
        color="hsl(43, 96%, 56%)"
      />
      <MacroProgressRing
        value={lemak}
        max={40}
        label="Lemak"
        unit="g"
        color="hsl(210, 79%, 46%)"
      />
    </div>
  );
}
