"use client";

import Link from "next/link";

import type { StoredUser } from "@/lib/api";

type WelcomeCardProps = {
  user: StoredUser;
  ctaHref: string;
  ctaLabel: string;
  title: string;
  subtitle: string;
};

export default function WelcomeCard({ user, ctaHref, ctaLabel, title, subtitle }: WelcomeCardProps) {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, #f7efe5 0%, #fdf7ef 100%)",
        border: "1px solid var(--border)",
        borderRadius: "28px",
        padding: "28px 30px",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        flexWrap: "wrap",
        marginBottom: "24px",
      }}
    >
      <div style={{ flex: 1, minWidth: "280px" }}>
        <p style={{ color: "var(--accent)", marginBottom: "8px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.8rem" }}>
          {user.role === "student" ? "Continue your mentorship journey" : "Welcome back, mentor"}
        </p>
        <h2 style={{ margin: "0 0 8px", fontSize: "clamp(24px, 3vw, 32px)" }}>{title}</h2>
        <p style={{ margin: 0, color: "var(--text-secondary)", maxWidth: "680px", lineHeight: 1.7 }}>
          {subtitle}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ padding: "8px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.7)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          {user.role === "student" ? "Ready for your next session" : "Requests are waiting"}
        </div>
        <Link
          href={ctaHref}
          style={{
            background: "var(--primary)",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "999px",
            padding: "12px 18px",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
