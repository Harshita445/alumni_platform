"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  color: "var(--text-secondary)",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border)",
  background: "var(--background)",
  color: "var(--text-primary)",
  fontSize: "15px",
  outline: "none",
};

export default function BookingPage() {
  const router = useRouter();

  const [sessionType, setSessionType] =
    useState("Resume Review");

  const [date, setDate] = useState("");

  const [time, setTime] = useState("");

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
          Book a Session
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
          }}
        >
          Schedule time with an alumnus for guidance,
          networking, or interview preparation.
        </p>
      </div>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "32px",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div>
          <label style={labelStyle}>
            Session Type
          </label>

          <select
            value={sessionType}
            onChange={(e) =>
              setSessionType(e.target.value)
            }
            style={inputStyle}
          >
            <option>Resume Review</option>
            <option>Mock Interview</option>
            <option>Career Guidance</option>
            <option>Networking Chat</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>
            Select Date
          </label>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Select Time
          </label>

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          disabled={!date || !time}
          onClick={() =>
            router.push("/bookings/confirmation")
          }
          style={{
            background:
              !date || !time
                ? "var(--border)"
                : "var(--primary)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            cursor:
              !date || !time
                ? "not-allowed"
                : "pointer",
            fontSize: "16px",
            fontWeight: 600,
          }}
        >
          Confirm Booking
        </button>
      </div>
    </main>
  );
}