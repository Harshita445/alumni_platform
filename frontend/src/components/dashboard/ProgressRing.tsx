"use client";

type ProgressRingProps = {
  progress: number;
  label: string;
};

export default function ProgressRing({ progress, label }: ProgressRingProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <svg width="96" height="96" viewBox="0 0 120 120" aria-label={`${label} progress`}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(122,75,46,0.12)" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div>
        <div style={{ fontSize: "30px", fontWeight: 700 }}>{progress}%</div>
        <div style={{ color: "var(--text-secondary)" }}>{label}</div>
      </div>
    </div>
  );
}
