import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: "square" | "circle" | "triangle";
}

interface ConfettiCelebrationProps {
  isActive: boolean;
  onComplete?: () => void;
  duration?: number;
  particleCount?: number;
}

const COLORS = [
  "hsl(160, 84%, 39%)", // primary green
  "hsl(217, 91%, 60%)", // secondary blue
  "hsl(25, 95%, 53%)",  // accent orange
  "hsl(45, 93%, 58%)",  // gold
  "hsl(280, 87%, 65%)", // purple
  "hsl(340, 82%, 59%)", // pink
];

const generateParticle = (id: number, width: number): Particle => {
  const startX = width / 2 + (Math.random() - 0.5) * 200;
  return {
    id,
    x: startX,
    y: -20,
    vx: (Math.random() - 0.5) * 8,
    vy: Math.random() * 3 + 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 10 + 6,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 15,
    shape: ["square", "circle", "triangle"][Math.floor(Math.random() * 3)] as Particle["shape"],
  };
};

export const ConfettiCelebration = ({
  isActive,
  onComplete,
  duration = 4000,
  particleCount = 80,
}: ConfettiCelebrationProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const startCelebration = useCallback(() => {
    const width = window.innerWidth;
    const initialParticles: Particle[] = [];
    
    // Create particles in waves
    for (let i = 0; i < particleCount; i++) {
      initialParticles.push(generateParticle(i, width));
    }
    
    setParticles(initialParticles);
    setIsVisible(true);
  }, [particleCount]);

  useEffect(() => {
    if (isActive) {
      startCelebration();
      
      // Cleanup after duration
      const timeout = setTimeout(() => {
        setIsVisible(false);
        setParticles([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [isActive, duration, onComplete, startCelebration]);

  // Animation loop
  useEffect(() => {
    if (!isVisible || particles.length === 0) return;

    const animate = () => {
      setParticles((prevParticles) =>
        prevParticles
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15, // gravity
            rotation: p.rotation + p.rotationSpeed,
            vx: p.vx * 0.99, // air resistance
          }))
          .filter((p) => p.y < window.innerHeight + 50)
      );
    };

    const animationId = requestAnimationFrame(animate);
    const interval = setInterval(animate, 16);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(interval);
    };
  }, [isVisible, particles.length]);

  if (!isVisible || particles.length === 0) return null;

  const renderParticle = (particle: Particle) => {
    const style: React.CSSProperties = {
      position: "absolute",
      left: particle.x,
      top: particle.y,
      width: particle.size,
      height: particle.size,
      backgroundColor: particle.shape !== "triangle" ? particle.color : "transparent",
      borderRadius: particle.shape === "circle" ? "50%" : "2px",
      transform: `rotate(${particle.rotation}deg)`,
      pointerEvents: "none",
      ...(particle.shape === "triangle" && {
        width: 0,
        height: 0,
        borderLeft: `${particle.size / 2}px solid transparent`,
        borderRight: `${particle.size / 2}px solid transparent`,
        borderBottom: `${particle.size}px solid ${particle.color}`,
        backgroundColor: "transparent",
      }),
    };

    return <div key={particle.id} style={style} />;
  };

  return createPortal(
    <div
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      {particles.map(renderParticle)}
      
      {/* Center celebration text */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
        <div className="bg-card/95 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-2xl border-2 border-primary">
          <div className="text-center">
            <span className="text-4xl mb-2 block">🎉</span>
            <h3 className="text-xl font-bold text-foreground">Selamat!</h3>
            <p className="text-sm text-muted-foreground">Meal plan seminggu lengkap!</p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
