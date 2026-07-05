"use client";

import Link from "next/link";

import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export default function EmptyState({ icon: Icon, title, description, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "24px",
        padding: "28px",
        textAlign: "center",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "999px",
          margin: "0 auto 16px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(122,75,46,0.12)",
        }}
      >
        <Icon size={24} color="var(--accent)" />
      </div>
      <h3 style={{ marginBottom: "8px" }}>{title}</h3>
      <p style={{ color: "var(--text-secondary)", marginBottom: "16px" }}>{description}</p>
      {ctaLabel && ctaHref ? (
        <Link href={ctaHref} style={{ color: "var(--accent)", fontWeight: 600 }}>
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
