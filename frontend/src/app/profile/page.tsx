"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import AccessGateCard from "@/components/AccessGateCard";
import { useAuth } from "@/hooks/useAuth";
import {
  AvailabilitySlot,
  UserProfile,
  createAvailability,
  deleteAvailability,
  fetchAvailability,
  fetchMentorshipServices,
  upsertMentorshipService,
} from "@/lib/api";
import { UserRound } from "lucide-react";

export default function MyProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <AccessGateCard
        icon={UserRound}
        title="Login to access your profile"
        description="Manage your account information, update your profile details, and stay connected with the Alumly community."
        bullets={[
          "View your account information",
          "Update your profile details",
          "Manage your mentorship activity",
        ]}
        buttonLabel="Go to Login"
        href="/login"
      />
    );
  }

  const profile = user.profile || {};
  const displayName = profile.full_name || user.email;
  const profileImage =
    profile.profile_image ||
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80";

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "48px 24px 80px",
      }}
    >
      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "40px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "32px",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "32px",
          }}
        >
          <Image
            src={profileImage}
            alt={displayName}
            width={120}
            height={120}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              border: "4px solid var(--surface-secondary)",
            }}
          />

          <div>
            <h1 style={{ marginBottom: "8px" }}>
              {displayName}
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                marginBottom: "8px",
              }}
            >
              {user.email}
            </p>
            <span
              style={{
                display: "inline-block",
                background: "var(--surface-secondary)",
                padding: "8px 14px",
                borderRadius: "999px",
                textTransform: "capitalize",
              }}
            >
              {user.role}
            </span>
          </div>
        </div>

        {user.role === "student" ? (
          <StudentSection profile={profile} />
        ) : (
          <AlumniSection profile={profile} />
        )}
      </section>
    </main>
  );
}

function StudentSection({ profile }: { profile: UserProfile }) {
  const hasProfile = Boolean(
    profile.branch || profile.graduation_year ||
      profile.target_companies || profile.desired_roles
  );

  if (!hasProfile) {
    return (
      <div>
        <h2 style={{ marginBottom: "16px" }}>
          Complete your profile
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "24px",
          }}
        >
          Tell us about your goals so we can recommend relevant alumni.
        </p>
        <Link
          href="/onboarding"
          style={{
            display: "inline-block",
            background: "var(--primary)",
            color: "#fff",
            padding: "14px 22px",
            borderRadius: "var(--radius-md)",
          }}
        >
          Complete Onboarding
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "24px",
      }}
    >
      <InfoCard
        label="Department"
        value={profile.branch || "Not specified"}
      />
      <InfoCard
        label="Graduation Year"
        value={profile.graduation_year || "Not specified"}
      />
      <InfoCard
        label="Target Companies"
        value={
          profile.target_companies?.join(", ") ||
          "Not specified"
        }
      />
      <InfoCard
        label="Desired Roles"
        value={
          profile.desired_roles?.join(", ") ||
          "Not specified"
        }
      />
    </div>
  );
}

function AlumniSection({ profile }: { profile: UserProfile }) {
  const { user } = useAuth();
  const [services, setServices] = useState<string[]>([]);
  const [pricing, setPricing] = useState<Record<string, string>>({});
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [newSlot, setNewSlot] = useState({ dayOfWeek: "1", startTime: "18:00", endTime: "19:00" });
  const [status, setStatus] = useState("Manage your mentorship settings below.");

  const serviceOptions = [
    "1:1 Career Guidance",
    "Mock Interviews",
    "Resume Reviews",
    "Group Sessions",
  ];

  const durationOptions = ["30 Minutes", "60 Minutes", "90 Minutes"];

  const weekdayLabel = (value: number) => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][value] || "Day";

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadSettings = async () => {
      try {
        const fetchedServices = await fetchMentorshipServices(user.id, user.access_token);
        setServices(fetchedServices.filter((item) => item.is_enabled).map((item) => item.service_type));
        const nextPricing = Object.fromEntries(
          fetchedServices
            .filter((item) => item.is_enabled)
            .map((item) => [item.service_type, item.price ? `₹${Number(item.price).toFixed(0)}` : "Free"])
        );
        setPricing(nextPricing);
        const fetchedAvailability = await fetchAvailability(user.id, user.access_token);
        setAvailability(fetchedAvailability);
      } catch {
        setStatus("We could not load the latest mentorship settings right now.");
      }
    };

    loadSettings();
  }, [user]);

  const previewDays = useMemo(() => {
    const days = Array.from(new Set(availability.map((slot) => slot.day_of_week).filter((value): value is number => value !== null && value !== undefined)));
    return days.map((value) => weekdayLabel(value)).join(" • ");
  }, [availability]);

  const handleServiceToggle = async (serviceType: string) => {
    if (!user) {
      return;
    }

    const nextServices = services.includes(serviceType)
      ? services.filter((item) => item !== serviceType)
      : [...services, serviceType];

    setServices(nextServices);

    try {
      await upsertMentorshipService(user.access_token, {
        alumni_id: user.id,
        service_type: serviceType,
        price: pricing[serviceType] && pricing[serviceType] !== "Free" ? Number(pricing[serviceType].replace(/[^0-9]/g, "")) : null,
        is_enabled: nextServices.includes(serviceType),
        currency: "INR",
      });
      setStatus("Mentorship services updated.");
    } catch {
      setStatus("Could not save the selected services.");
    }
  };

  const handlePricingChange = async (serviceType: string, value: string) => {
    if (!user) {
      return;
    }

    const nextPricing = { ...pricing, [serviceType]: value };
    setPricing(nextPricing);

    try {
      await upsertMentorshipService(user.access_token, {
        alumni_id: user.id,
        service_type: serviceType,
        price: value && value !== "Free" ? Number(value.replace(/[^0-9]/g, "")) : null,
        is_enabled: services.includes(serviceType),
        currency: "INR",
      });
      setStatus("Pricing updated.");
    } catch {
      setStatus("Could not save pricing.");
    }
  };

  const handleAddAvailability = async () => {
    if (!user) {
      return;
    }

    try {
      const created = await createAvailability(user.access_token, {
        day_of_week: Number(newSlot.dayOfWeek),
        start_time: newSlot.startTime,
        end_time: newSlot.endTime,
        timezone: "Asia/Kolkata",
      });
      setAvailability((current) => [...current, created]);
      setStatus("Availability slot added.");
    } catch {
      setStatus("Could not save the availability slot.");
    }
  };

  const handleDeleteAvailability = async (availabilityId: number) => {
    if (!user) {
      return;
    }

    try {
      await deleteAvailability(user.access_token, availabilityId);
      setAvailability((current) => current.filter((slot) => slot.id !== availabilityId));
      setStatus("Availability slot removed.");
    } catch {
      setStatus("Could not remove the availability slot.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "24px",
        }}
      >
        <InfoCard label="Company" value={profile.company || "Not specified"} />
        <InfoCard label="Designation" value={profile.designation || "Not specified"} />
        <InfoCard label="Graduation Year" value={profile.graduation_year || "Not specified"} />
        <InfoCard
          label="LinkedIn"
          value={
            profile.linkedin_url ? (
              <a href={profile.linkedin_url} target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>
                View profile
              </a>
            ) : (
              "Not specified"
            )
          }
        />
      </div>

      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "6px" }}>Mentorship Settings</h2>
          <p style={{ color: "var(--text-secondary)" }}>{status}</p>
        </div>

        <div>
          <h3 style={{ marginBottom: "12px" }}>Session Types</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {serviceOptions.map((option) => {
              const selected = services.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleServiceToggle(option)}
                  style={{
                    border: `1px solid ${selected ? "var(--primary)" : "var(--border)"}`,
                    background: selected ? "rgba(106, 68, 48, 0.08)" : "white",
                    color: selected ? "var(--primary)" : "var(--text-primary)",
                    borderRadius: "999px",
                    padding: "10px 14px",
                    cursor: "pointer",
                  }}
                >
                  {selected ? "✓ " : "○ "}{option}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: "12px" }}>Pricing</h3>
          <div style={{ display: "grid", gap: "10px" }}>
            {serviceOptions.map((option) => (
              <div key={option} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <span>{option}</span>
                <input
                  value={pricing[option] || "Free"}
                  onChange={(event) => handlePricingChange(option, event.target.value)}
                  placeholder="Free"
                  style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "8px 12px", minWidth: "140px" }}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: "12px" }}>Availability</h3>
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <select value={newSlot.dayOfWeek} onChange={(event) => setNewSlot((current) => ({ ...current, dayOfWeek: event.target.value }))} style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "8px 12px" }}>
                {Array.from({ length: 7 }, (_, index) => (
                  <option key={index} value={index}>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</option>
                ))}
              </select>
              <input type="time" value={newSlot.startTime} onChange={(event) => setNewSlot((current) => ({ ...current, startTime: event.target.value }))} style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "8px 12px" }} />
              <input type="time" value={newSlot.endTime} onChange={(event) => setNewSlot((current) => ({ ...current, endTime: event.target.value }))} style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "8px 12px" }} />
              <button type="button" onClick={handleAddAvailability} style={{ border: "1px solid var(--primary)", background: "var(--primary)", color: "white", borderRadius: "10px", padding: "8px 12px", cursor: "pointer" }}>Add Slot</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {availability.map((slot) => (
                <div key={slot.id} style={{ border: "1px solid var(--border)", borderRadius: "999px", padding: "8px 12px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <span>{slot.day_of_week !== null && slot.day_of_week !== undefined ? weekdayLabel(slot.day_of_week) : "Date"} • {slot.start_time} - {slot.end_time}</span>
                  <button type="button" onClick={() => handleDeleteAvailability(slot.id)} style={{ color: "var(--primary)", cursor: "pointer" }}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: "12px" }}>Availability Preview</h3>
          <p style={{ color: "var(--text-secondary)" }}>Available This Week • {previewDays || "No slots yet"}</p>
          <div style={{ marginTop: "10px", color: "var(--text-secondary)" }}>
            {availability.length > 0 ? availability.map((slot) => <div key={slot.id}>{weekdayLabel(slot.day_of_week ?? 0)} • {slot.start_time} - {slot.end_time}</div>) : <div>No availability configured yet.</div>}
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: "12px" }}>Session Duration</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {durationOptions.map((option) => (
              <span key={option} style={{ border: "1px solid var(--border)", borderRadius: "999px", padding: "8px 12px" }}>{option}</span>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: "12px" }}>Timezone</h3>
          <p style={{ color: "var(--text-secondary)" }}>Asia/Kolkata</p>
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string | number | React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
      }}
    >
      <p
        style={{
          color: "var(--text-secondary)",
          marginBottom: "10px",
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: "16px", lineHeight: 1.6 }}>
        {value}
      </p>
    </div>
  );
}
