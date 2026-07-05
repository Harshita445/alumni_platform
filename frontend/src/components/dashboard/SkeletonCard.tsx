"use client";

export default function SkeletonCard() {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "22px",
        padding: "20px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ height: "12px", width: "60%", borderRadius: "999px", background: "rgba(122,75,46,0.12)", marginBottom: "12px" }} />
      <div style={{ height: "12px", width: "80%", borderRadius: "999px", background: "rgba(122,75,46,0.08)", marginBottom: "10px" }} />
      <div style={{ height: "12px", width: "55%", borderRadius: "999px", background: "rgba(122,75,46,0.08)" }} />
    </div>
  );
}
