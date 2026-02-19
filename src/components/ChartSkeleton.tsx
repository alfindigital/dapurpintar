import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ChartSkeletonProps {
  /** Height of the chart area */
  chartHeight?: string;
  /** Show stat row above chart */
  showStats?: boolean;
  /** Number of stat items */
  statCount?: number;
  /** Show toggle bar */
  showToggle?: boolean;
}

export function ChartSkeleton({ 
  chartHeight = "h-[180px]", 
  showStats = false, 
  statCount = 3,
  showToggle = false 
}: ChartSkeletonProps) {
  return (
    <Card className="border-0 shadow-soft-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showToggle && (
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-lg" />
            ))}
          </div>
        )}

        {showStats && (
          <div className={`grid grid-cols-${statCount} gap-2`}>
            {Array.from({ length: statCount }).map((_, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-muted/40 text-center space-y-1.5">
                <Skeleton className="h-5 w-10 mx-auto" />
                <Skeleton className="h-2.5 w-16 mx-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Chart area skeleton with animated bars */}
        <div className={`${chartHeight} flex items-end justify-around gap-2 px-4`}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <Skeleton 
                className="w-full rounded-t-md" 
                style={{ 
                  height: `${30 + Math.random() * 55}%`,
                  animationDelay: `${i * 100}ms` 
                }} 
              />
              <Skeleton className="h-3 w-6" />
            </div>
          ))}
        </div>

        {/* Bottom summary skeleton */}
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-2 rounded-xl bg-muted/40 text-center space-y-1.5">
              <Skeleton className="h-2.5 w-12 mx-auto" />
              <Skeleton className="h-4 w-8 mx-auto" />
              <Skeleton className="h-2 w-14 mx-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function HeatmapSkeleton() {
  return (
    <Card className="border-0 shadow-soft-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-muted/40 text-center space-y-1.5">
              <Skeleton className="h-5 w-8 mx-auto" />
              <Skeleton className="h-2.5 w-16 mx-auto" />
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="space-y-1">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
          {Array.from({ length: 4 }).map((_, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, di) => (
                <Skeleton 
                  key={di} 
                  className="aspect-square rounded" 
                  style={{ animationDelay: `${(wi * 7 + di) * 30}ms` }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-1.5">
          <Skeleton className="h-3 w-10" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-3 rounded-sm" />
          ))}
          <Skeleton className="h-3 w-10" />
        </div>
      </CardContent>
    </Card>
  );
}

export function WeightChartSkeleton() {
  return (
    <Card className="border-0 shadow-soft-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-16 rounded-md" />
            <Skeleton className="h-7 w-16 rounded-md" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-muted/40 space-y-1.5">
              <Skeleton className="h-2.5 w-12 mx-auto" />
              <Skeleton className="h-4 w-14 mx-auto" />
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="h-[180px] flex items-end justify-around gap-3 px-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <Skeleton 
                className="w-2 rounded-full" 
                style={{ 
                  height: `${40 + Math.sin(i * 0.8) * 30}%`,
                  animationDelay: `${i * 80}ms` 
                }} 
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
