"use client";

import { ExternalLink, Sparkles } from "lucide-react";

import Badge from "@/components/Badge";
import type { Booking } from "@/types/Booking";

type BookingCardProps = {
  booking: Booking;
  role: "student" | "alumni";
  onPrimaryAction?: (booking: Booking) => void;
};

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BookingCard({ booking, role, onPrimaryAction }: BookingCardProps) {
  const isStudent = role === "student";
  const actionLabel = booking.status === "awaiting_payment"
    ? "Complete Payment"
    : booking.status === "confirmed"
      ? "Open Meeting"
      : booking.status === "pending"
        ? "Awaiting Review"
        : "View Details";

  const handleAction = () => {
    if (booking.status === "confirmed" && booking.meeting_link) {
      window.open(booking.meeting_link, "_blank", "noopener,noreferrer");
      return;
    }

    onPrimaryAction?.(booking);
  };

  return (
    <article
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "22px",
        padding: "20px 22px",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "999px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(122,75,46,0.12)",
            flexShrink: 0,
          }}
        >
          <Sparkles size={18} color="var(--accent)" />
        </div>
        <div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "8px" }}>
            <h4 style={{ margin: 0 }}>{booking.session_type}</h4>
            <Badge text={booking.status} tone={booking.status} />
          </div>
          <p style={{ margin: "0 0 6px", color: "var(--text-secondary)" }}>
            {formatDateLabel(booking.date)} · {booking.time}
          </p>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
            {isStudent ? "Mentorship session" : "Student request"}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          onClick={handleAction}
          style={{
            background: booking.status === "confirmed" ? "var(--primary)" : "var(--surface-secondary)",
            color: booking.status === "confirmed" ? "#fff" : "var(--text-primary)",
            border: "none",
            borderRadius: "999px",
            padding: "10px 14px",
            cursor: "pointer",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {actionLabel}
          {booking.status === "confirmed" ? <ExternalLink size={14} /> : null}
        </button>
      </div>
    </article>
  );
}
