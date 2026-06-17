"use client";

import { useState } from "react";
import { uniqueCompanies } from "@/data/companies";

export default function OnboardingForm() {
  const [form, setForm] = useState({
    graduationYear: "",
    department: "",
    targetCompanies: [] as string[],
    desiredRoles: [] as string[],
    goals: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    localStorage.setItem(
      "student-profile",
      JSON.stringify(form)
    );

    alert("Profile saved successfully.");
  };

  const inputStyle = {
    padding: "12px 16px",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    fontSize: "16px",
    width: "100%",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <input
        name="graduationYear"
        placeholder="Graduation year"
        value={form.graduationYear}
        onChange={handleChange}
        style={inputStyle}
      />

      <input
        name="department"
        placeholder="Department"
        value={form.department}
        onChange={handleChange}
        style={inputStyle}
      />

      <select
        multiple
        value={form.targetCompanies}
        onChange={(e) =>
          setForm({
            ...form,
            targetCompanies: Array.from(
              e.target.selectedOptions,
              (option) => option.value
            ),
          })
        }
        style={{
          ...inputStyle,
          minHeight: "140px",
        }}
      >
        {uniqueCompanies.map((company) => (
          <option
            key={company}
            value={company}
          >
            {company}
          </option>
        ))}
      </select>

      <input
        value={form.desiredRoles.join(", ")}
        placeholder="Desired roles (comma separated)"
        onChange={(e) =>
          setForm({
            ...form,
            desiredRoles: e.target.value
              .split(",")
              .map((role) => role.trim())
              .filter(Boolean),
          })
        }
        style={inputStyle}
      />

      <textarea
        name="goals"
        placeholder="What do you need help with?"
        value={form.goals}
        onChange={handleChange}
        style={{
          ...inputStyle,
          minHeight: "120px",
          resize: "vertical",
        }}
      />

      <button
        onClick={handleSubmit}
        style={{
          padding: "14px 20px",
          border: "none",
          borderRadius: "12px",
          background: "var(--accent)",
          color: "white",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: 600,
        }}
      >
        Save Preferences
      </button>
    </div>
  );
}