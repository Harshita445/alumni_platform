"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockAlumni } from "@/data/mockAlumni";
import type { Booking } from "@/types/Booking";

export default function BookingConfirmationPage() {
  const router = useRouter();
  const [booking] = useState<Booking | null>(
    () => {
      if (typeof window === "undefined") {
        return null;
      }

      const stored = localStorage.getItem(
        "latest-booking"
      );

      if (!stored) {
        return null;
      }

      try {
        return JSON.parse(stored) as Booking;
      } catch {
        return null;
      }
    }
  );

  if (!booking) {
    return (
      <main
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          padding: "48px 24px 80px",
        }}
      >
        <h1>Booking not found</h1>
        <p>
          It looks like there isn’t any booking data saved.
          Please try booking again.
        </p>
      </main>
    );
  }

  const alumni = mockAlumni.find(
    (person) => person.id === String(booking.alumni_id)
  );

  return (
    <main
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "48px 24px 80px",
      }}
    >
      <div
        style={{
          marginBottom: "32px",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 56px)",
            marginBottom: "12px",
          }}
        >
          Booking Confirmed
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
          }}
        >
          Your session has been booked successfully.
        </p>
      </div>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "32px",
          boxShadow: "var(--shadow-sm)",
          display: "grid",
          gap: "18px",
        }}
      >
        <div>
          <strong>Alumnus</strong>
          <p>{alumni?.name ?? `ID ${booking.alumni_id}`}</p>
        </div>

        <div>
          <strong>Session Type</strong>
          <p>{booking.session_type}</p>
        </div>

        <div>
          <strong>Date</strong>
          <p>{booking.date}</p>
        </div>

        <div>
          <strong>Time</strong>
          <p>{booking.time}</p>
        </div>

        <div>
          <strong>Status</strong>
          <p>{booking.status}</p>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          style={{
            marginTop: "16px",
            width: "fit-content",
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "14px 22px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: 600,
          }}
        >
          Return to Dashboard
        </button>
      </div>
    </main>
  );
}
