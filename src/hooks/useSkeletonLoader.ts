import { useState, useEffect } from "react";

/**
 * Shows a brief skeleton loading state on mount for smoother perceived loading.
 * @param delay Duration in ms to show skeleton (default: 400ms)
 */
export function useSkeletonLoader(delay = 400) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return isLoading;
}
