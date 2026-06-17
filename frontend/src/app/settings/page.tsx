"use client";

import { useEffect, useState } from "react";

type Settings = {
  emailNotifications: boolean;
  bookingReminders: boolean;
  publicProfile: boolean;
  timezone: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    emailNotifications: true,
    bookingReminders: true,
    publicProfile: true,
    timezone: "Asia/Kolkata",
  });

  useEffect(() => {
    const saved = localStorage.getItem("app-settings");

    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "app-settings",
      JSON.stringify(settings)
    );
  }, [settings]);

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
          fontSize: "clamp(36px, 5vw, 56px)",
          marginBottom: "32px",
        }}
      >
        Settings
      </h1>

      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <Toggle
          label="Email notifications"
          checked={settings.emailNotifications}
          onChange={() =>
            setSettings({
              ...settings,
              emailNotifications:
                !settings.emailNotifications,
            })
          }
        />

        <Toggle
          label="Booking reminders"
          checked={settings.bookingReminders}
          onChange={() =>
            setSettings({
              ...settings,
              bookingReminders:
                !settings.bookingReminders,
            })
          }
        />

        <Toggle
          label="Public profile visibility"
          checked={settings.publicProfile}
          onChange={() =>
            setSettings({
              ...settings,
              publicProfile:
                !settings.publicProfile,
            })
          }
        />

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
            }}
          >
            Timezone
          </label>

          <select
            value={settings.timezone}
            onChange={(e) =>
              setSettings({
                ...settings,
                timezone: e.target.value,
              })
            }
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--background)",
            }}
          >
            <option value="Asia/Kolkata">
              India (IST)
            </option>

            <option value="America/New_York">
              New York (EST)
            </option>

            <option value="Europe/London">
              London (GMT)
            </option>
          </select>
        </div>
      </div>
    </main>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {label}

      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
    </label>
  );
}