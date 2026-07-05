"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type QuickActionItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

type QuickActionGridProps = {
  items: QuickActionItem[];
};

export default function QuickActionGrid({ items }: QuickActionGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "14px",
        marginBottom: "24px",
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            style={{
              textDecoration: "none",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "20px",
              padding: "18px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              boxShadow: "var(--shadow-sm)",
              transition: "transform 200ms ease, box-shadow 200ms ease",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "999px",
                background: "rgba(122,75,46,0.12)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={18} color="var(--accent)" />
            </div>
            <strong style={{ color: "var(--text-primary)" }}>{item.label}</strong>
            {item.description ? <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{item.description}</span> : null}
          </Link>
        );
      })}
    </div>
  );
}
