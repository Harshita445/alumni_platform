"use client";

import type { LucideIcon } from "lucide-react";
import { Bell, Search } from "lucide-react";

import type { StoredUser } from "@/lib/api";

type DashboardHeaderProps = {
  user: StoredUser;
  unreadCount: number;
};

export default function DashboardHeader({ user, unreadCount }: DashboardHeaderProps) {
  const currentDate = new Date().toLocaleDateString("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "24px",
        flexWrap: "wrap",
        background: "rgba(255, 248, 239, 0.9)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px 28px",
        boxShadow: "var(--shadow-sm)",
        marginBottom: "24px",
      }}
    >
      <div>
        <p style={{ color: "var(--accent)", marginBottom: "8px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.8rem" }}>
          {user.role === "student" ? greeting : "Welcome back"}
        </p>
        <h2 style={{ margin: 0, fontSize: "clamp(24px, 3vw, 32px)" }}>
          {user.profile?.full_name || user.email}
        </h2>
        <p style={{ color: "var(--text-secondary)", marginTop: "6px" }}>{currentDate}</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "999px",
            padding: "10px 14px",
            minWidth: "220px",
          }}
        >
          <Search size={16} color="var(--text-secondary)" />
          <input
            aria-label="Quick search"
            placeholder="Quick search"
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              color: "var(--text-primary)",
              width: "100%",
            }}
          />
        </label>

        <div
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            borderRadius: "999px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <Bell size={18} />
          {unreadCount > 0 ? (
            <span
              style={{
                position: "absolute",
                top: "2px",
                right: "2px",
                width: "12px",
                height: "12px",
                borderRadius: "999px",
                background: "var(--accent)",
                border: "2px solid var(--surface)",
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
