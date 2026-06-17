"use client";

import { useState } from "react";

export default function OnboardingPage() {
  const [department, setDepartment] = useState("");
  const [goal, setGoal] = useState("");

  return (
    <main
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "48px 24px 80px",
      }}
    >
      <h1
        style={{
          marginBottom: "32px",
          fontSize: "clamp(36px, 5vw, 56px)",
        }}
      >
        Tell us about yourself
      </h1>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <input
          placeholder="Department"
          value={department}
          onChange={(e) =>
            setDepartment(e.target.value)
          }
          style={inputStyle}
        />

        <textarea
          placeholder="What are your career goals?"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          style={{
            ...inputStyle,
            minHeight: "140px",
          }}
        />

        <button
          style={{
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            padding: "16px",
            borderRadius: "var(--radius-md)",
          }}
        >
          Save Preferences
        </button>
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--border)",
  background: "var(--background)",
};