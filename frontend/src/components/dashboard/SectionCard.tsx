"use client";

import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
};

export default function SectionCard({ title, subtitle, action, children }: SectionCardProps) {
  return (
    <section
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "24px",
        padding: "24px",
        boxShadow: "var(--shadow-sm)",
        marginBottom: "24px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "20px" }}>{title}</h3>
          {subtitle ? <p style={{ margin: "6px 0 0", color: "var(--text-secondary)" }}>{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
