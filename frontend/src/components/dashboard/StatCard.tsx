"use client";

type StatCardProps = {
  label: string;
  value: number;
  accent?: string;
};

export default function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "22px",
        padding: "22px 24px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <p style={{ color: "var(--text-secondary)", marginBottom: "8px" }}>{label}</p>
      <h3 style={{ margin: 0, fontSize: "34px", color: accent || "var(--text-primary)" }}>{value}</h3>
    </div>
  );
}
