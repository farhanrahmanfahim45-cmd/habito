import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { matchLabel } from "@/lib/matching";

/**
 * The score, drawn rather than printed. Animates once on entry — the number
 * counting up is the only moment on the page that asks for attention.
 */
export function MatchRing({
  score,
  size = 88,
  showLabel = true,
  className,
}: {
  score: number;
  size?: number;
  showLabel?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(score);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 700;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setShown(Math.round(score * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [score]);

  const stroke = size >= 70 ? 7 : 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div ref={ref} className={cn("inline-flex items-center gap-3", className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-ink/10" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            className="text-aqua-600 transition-[stroke-dashoffset] duration-150"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - shown / 100)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-display font-bold text-ink tnum"
          style={{ fontSize: size * 0.28 }}
        >
          {shown}
          <span style={{ fontSize: size * 0.16 }} className="ml-0.5 text-muted">%</span>
        </span>
      </div>
      {showLabel && (
        <div>
          <p className="font-display font-bold leading-tight text-ink">{matchLabel(score)}</p>
          <p className="text-xs text-muted">Habito Match</p>
        </div>
      )}
      <span className="sr-only">{score}% match — {matchLabel(score)}</span>
    </div>
  );
}

/** Compact pill for card corners. */
export function MatchPill({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ink/85 px-2.5 py-1 text-xs font-bold text-ivory backdrop-blur-sm tnum">
      <span className="size-1.5 rounded-full bg-aqua-400" aria-hidden />
      {score}% match
    </span>
  );
}
