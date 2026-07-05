"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import AccessGateCard from "@/components/AccessGateCard";
import ProfileImageUploader from "@/components/ProfileImageUploader";
import ResumeUploader from "@/components/ResumeUploader";
import { useAuth } from "@/hooks/useAuth";
import {
  UserProfile,
  fetchMentorshipServices,
  upsertMentorshipService,
  createAvailability,
  updateProfile,
  mergeProfileIntoStoredUser,
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
            display: "grid",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Image
                src={profileImage}
                alt={displayName}
                width={132}
                height={132}
                style={{
                  width: "132px",
                  height: "132px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "4px solid var(--surface-secondary)",
                  boxShadow: "0 12px 24px rgba(81, 59, 34, 0.12)",
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: "260px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
                <h1 style={{ margin: 0, fontSize: "clamp(1.8rem, 3vw, 2.4rem)", lineHeight: 1.2 }}>
                  {displayName}
                </h1>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    background: "var(--surface-secondary)",
                    padding: "8px 14px",
                    borderRadius: "999px",
                    textTransform: "capitalize",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                  }}
                >
                  {user.role}
                </span>
              </div>
              <p style={{ color: "var(--text-secondary)", margin: "0 0 16px" }}>
                {user.email}
              </p>
              <div style={{ display: "grid", gap: "12px", maxWidth: "360px" }}>
                <ProfileImageUploader initialPreview={profile.profile_picture_url || profile.profile_image} />
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              padding: "16px 18px",
              background: "var(--surface-secondary)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <ResumeUploader initialFileName={profile.resume_url ? "resume.pdf" : null} />
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
      profile.target_companies?.length || profile.desired_roles?.length ||
      profile.skills?.length || profile.career_interests?.length || profile.goals
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "24px",
        }}
      >
        <InfoCard label="Department" value={profile.branch || "Not specified"} />
        <InfoCard label="Graduation Year" value={profile.graduation_year || "Not specified"} />
        <InfoCard label="Target Companies" value={profile.target_companies?.join(", ") || "Not specified"} />
        <InfoCard label="Desired Roles" value={profile.desired_roles?.join(", ") || "Not specified"} />
      </div>
      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "24px", display: "grid", gap: "16px" }}>
        <div>
          <h3 style={{ marginBottom: "8px" }}>Skills</h3>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>{profile.skills?.join(", ") || "No skills added yet."}</p>
        </div>
        <div>
          <h3 style={{ marginBottom: "8px" }}>Career Interests</h3>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>{profile.career_interests?.join(", ") || "No interests added yet."}</p>
        </div>
        <div>
          <h3 style={{ marginBottom: "8px" }}>Mentorship Goals</h3>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>{profile.goals || "No goals added yet."}</p>
        </div>
      </section>
    </div>
  );
}

function AlumniSection({ profile }: { profile: UserProfile }) {
  const { user, login } = useAuth();
  const [services, setServices] = useState<string[]>([]);
  const [pricing, setPricing] = useState<Record<string, string>>({});
  const [sessionDetails, setSessionDetails] = useState<Record<string, { date: string; startTime: string; duration: number; endTime: string }>>({});
  const [sessionSlots, setSessionSlots] = useState<Record<string, Array<{ id: string; date: string; startTime: string; duration: number; endTime: string }>>>({});
  const [status, setStatus] = useState("Manage your mentorship settings below.");
  const [payoutMethod, setPayoutMethod] = useState("UPI");
  const [payoutDetails, setPayoutDetails] = useState({ upiId: "", accountHolder: "", accountNumber: "", confirmAccountNumber: "", ifsc: "" });
  const [payoutVerified, setPayoutVerified] = useState("pending");
  const [draftProfile, setDraftProfile] = useState<UserProfile>(profile);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [lastSavedProfile, setLastSavedProfile] = useState<UserProfile>(profile);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const priceOptions = ["Free", "₹100", "₹150", "₹200", "₹250"];
  const durationOptions = [30, 60, 90];

  const computeEndTime = (startTime: string, duration: number) => {
    const [hour, minute] = startTime.split(":").map(Number);
    const totalMinutes = hour * 60 + minute + duration;
    const endHour = Math.floor((totalMinutes % (24 * 60)) / 60);
    const endMinute = totalMinutes % 60;
    return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
  };

  const handleSessionDurationChange = (serviceType: string, duration: number) => {
    setSessionDetails((current) => {
      const existing = current[serviceType] || { date: "", startTime: "10:00", duration, endTime: computeEndTime("10:00", duration) };
      return {
        ...current,
        [serviceType]: {
          ...existing,
          duration,
          endTime: computeEndTime(existing.startTime, duration),
        },
      };
    });
  };

  const isGroupSession = (serviceType: string) => serviceType === "Group Sessions";

  const handleSessionStartTimeChange = (serviceType: string, startTime: string) => {
    setSessionDetails((current) => {
      const existing = current[serviceType] || { date: "", startTime, duration: 30, endTime: computeEndTime(startTime, 30) };
      return {
        ...current,
        [serviceType]: {
          ...existing,
          startTime,
          endTime: computeEndTime(startTime, existing.duration),
        },
      };
    });
  };

  const weekDates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return date;
    });
  }, []);

  const handleSelectWeekDate = (serviceType: string, date: string) => {
    setSessionDetails((current) => ({
      ...current,
      [serviceType]: {
        ...(current[serviceType] || { startTime: "10:00", duration: 30, endTime: computeEndTime("10:00", 30) }),
        date,
      },
    }));
  };

  const handleAddSessionSlot = (serviceType: string) => {
    const details = sessionDetails[serviceType] || { date: "", startTime: "10:00", duration: 30, endTime: computeEndTime("10:00", 30) };

    if (!details.date) {
      setStatus("Please select a date from this week before adding a slot.");
      return;
    }

    const slot = {
      id: `${serviceType}-${details.date}-${details.startTime}-${Date.now()}`,
      date: details.date,
      startTime: details.startTime,
      duration: details.duration,
      endTime: details.endTime,
    };

    setSessionSlots((current) => ({
      ...current,
      [serviceType]: [...(current[serviceType] || []), slot],
    }));
    setStatus("Session slot added. Add another slot or save and move to the next service.");
  };

  const handleRemoveSessionSlot = (serviceType: string, slotId: string) => {
    setSessionSlots((current) => ({
      ...current,
      [serviceType]: (current[serviceType] || []).filter((slot) => slot.id !== slotId),
    }));
  };

  const handleSaveServiceSchedule = (serviceType: string) => {
    setStatus(`Schedule saved for ${serviceType}. You can move to the next service.`);
  };

  const handleSaveBookingSchedule = async () => {
    if (!user) {
      return;
    }

    const slots = Object.values(sessionSlots).flat();

    if (slots.length === 0) {
      setStatus("Add one or more slots before saving your booking schedule.");
      return;
    }

    setStatus("Saving booking schedule...");

    try {
      await Promise.all(
        slots.map((slot) =>
          createAvailability(user.access_token, {
            date: slot.date,
            start_time: slot.startTime,
            end_time: slot.endTime,
            timezone: "Asia/Kolkata",
          })
        )
      );
      setStatus("Booking schedule saved. Your session dates and times are now persisted.");
    } catch {
      setStatus("Could not save booking slots. Please try again.");
    }
  };

  const selectedPaidSessions = services.some(
    (service) => !isGroupSession(service) && pricing[service] && pricing[service] !== "Free"
  );
  const showUpiField = selectedPaidSessions;

  const buildProfilePayload = (value: UserProfile) => ({
    full_name: value.full_name || undefined,
    company: value.company || undefined,
    designation: value.designation || undefined,
    graduation_year: value.graduation_year ? Number(value.graduation_year) : undefined,
    linkedin_url: value.linkedin_url || undefined,
    bio: value.bio || undefined,
    expertise: value.expertise || [],
  });

  const persistProfile = async (value: UserProfile) => {
    if (!user) {
      return;
    }

    setIsSavingProfile(true);
    setSaveMessage(null);
    setSaveState("saving");

    try {
      const updatedProfile = await updateProfile(user.access_token, buildProfilePayload(value));
      login(mergeProfileIntoStoredUser(user, updatedProfile));
      setDraftProfile(updatedProfile);
      setLastSavedProfile(updatedProfile);
      setSaveMessage("Profile saved automatically.");
      setSaveState("saved");
    } catch {
      setSaveMessage("We could not save your profile changes.");
      setSaveState("error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    setDraftProfile(profile);
    setLastSavedProfile(profile);
    setSaveState("idle");
  }, [profile, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const hasChanges = JSON.stringify(draftProfile) !== JSON.stringify(lastSavedProfile);

    if (!hasChanges) {
      setSaveState("idle");
      return;
    }

    const timer = window.setTimeout(() => {
      void persistProfile(draftProfile);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [draftProfile, lastSavedProfile, user]);

  const serviceOptions = [
    "1:1 Career Guidance",
    "Mock Interviews",
    "Resume Reviews",
    "Group Sessions",
  ];

  const formatWeekLabel = (date: Date) => {
    const weekday = new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date);
    const day = date.getDate();
    const month = new Intl.DateTimeFormat("en-IN", { month: "short" }).format(date);
    return `${weekday} ${day} ${month}`;
  };

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
            .map((item) => [
              item.service_type,
              item.service_type === "Group Sessions"
                ? "Free"
                : item.price
                ? `₹${Number(item.price).toFixed(0)}`
                : "Free",
            ])
        );
        setPricing(nextPricing);

        const payoutResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/payments/payout-settings/me`, {
          headers: { Authorization: `Bearer ${user.access_token}` },
        });
        if (payoutResponse.ok) {
          const payoutData = await payoutResponse.json();
          if (payoutData) {
            setPayoutMethod(payoutData.method || "UPI");
            setPayoutDetails({
              upiId: payoutData.upi_id || "",
              accountHolder: payoutData.account_holder || "",
              accountNumber: payoutData.account_number || "",
              confirmAccountNumber: payoutData.account_number || "",
              ifsc: payoutData.ifsc || "",
            });
            setPayoutVerified(payoutData.verified || "pending");
          }
        }
      } catch {
        setStatus("We could not load the latest mentorship settings right now.");
      }
    };

    loadSettings();
  }, [user]);


  const handleServiceToggle = async (serviceType: string) => {
    if (!user) {
      return;
    }

    const nextServices = services.includes(serviceType)
      ? services.filter((item) => item !== serviceType)
      : [...services, serviceType];

    if (!services.includes(serviceType) && isGroupSession(serviceType)) {
      setPricing((current) => ({ ...current, [serviceType]: "Free" }));
    }

    setServices(nextServices);

    try {
      await upsertMentorshipService(user.access_token, {
        alumni_id: user.id,
        service_type: serviceType,
        price: isGroupSession(serviceType)
          ? null
          : pricing[serviceType] && pricing[serviceType] !== "Free"
          ? Number(pricing[serviceType].replace(/[^0-9]/g, ""))
          : null,
        is_enabled: nextServices.includes(serviceType),
        currency: "INR",
      });
      setStatus("Mentorship services updated.");
    } catch {
      setStatus("Could not save the selected services.");
    }
  };

  const handlePricingChange = async (serviceType: string, value: string) => {
    if (!user || isGroupSession(serviceType)) {
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

  const handlePayoutSave = async () => {
    if (!user) {
      return;
    }

    if (payoutMethod === "Bank Transfer" && payoutDetails.accountNumber !== payoutDetails.confirmAccountNumber) {
      setStatus("Account numbers do not match.");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/payments/payout-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.access_token}` },
        body: JSON.stringify({
          method: payoutMethod,
          upi_id: payoutMethod === "UPI" ? payoutDetails.upiId : null,
          account_holder: payoutMethod === "Bank Transfer" ? payoutDetails.accountHolder : null,
          account_number: payoutMethod === "Bank Transfer" ? payoutDetails.accountNumber : null,
          ifsc: payoutMethod === "Bank Transfer" ? payoutDetails.ifsc : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save payout details.");
      }

      setStatus("Payout details saved.");
      setPayoutVerified("pending");
    } catch {
      setStatus("Could not save payout details.");
    }
  };

  const handleProfileSave = async () => {
    await persistProfile(draftProfile);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "24px",
          display: "grid",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: "0 0 6px" }}>Profile details</h2>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>Add the details students should see when they discover you.</p>
          </div>
          <button type="button" onClick={handleProfileSave} style={{ border: "1px solid var(--primary)", background: "var(--primary)", color: "white", borderRadius: "999px", padding: "10px 16px", cursor: "pointer" }}>
            {isSavingProfile ? "Saving..." : "Save profile"}
          </button>
        </div>

        {saveMessage ? (
          <p style={{ margin: 0, color: saveState === "error" ? "var(--danger)" : "var(--primary)" }}>
            {saveMessage}
          </p>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: 600, color: "var(--text-primary)" }}>
            <span>Full name</span>
            <input value={draftProfile.full_name || ""} onChange={(event) => setDraftProfile((current) => ({ ...current, full_name: event.target.value }))} style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px", background: "var(--surface-secondary)" }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: 600, color: "var(--text-primary)" }}>
            <span>Company</span>
            <input value={draftProfile.company || ""} onChange={(event) => setDraftProfile((current) => ({ ...current, company: event.target.value }))} style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px", background: "var(--surface-secondary)" }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: 600, color: "var(--text-primary)" }}>
            <span>Designation</span>
            <input value={draftProfile.designation || ""} onChange={(event) => setDraftProfile((current) => ({ ...current, designation: event.target.value }))} style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px", background: "var(--surface-secondary)" }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: 600, color: "var(--text-primary)" }}>
            <span>Graduation year</span>
            <input type="number" value={draftProfile.graduation_year ?? ""} onChange={(event) => setDraftProfile((current) => ({ ...current, graduation_year: event.target.value ? Number(event.target.value) : null }))} style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px", background: "var(--surface-secondary)" }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: 600, color: "var(--text-primary)" }}>
            <span>LinkedIn</span>
            <input value={draftProfile.linkedin_url || ""} onChange={(event) => setDraftProfile((current) => ({ ...current, linkedin_url: event.target.value }))} style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px", background: "var(--surface-secondary)" }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: 600, color: "var(--text-primary)" }}>
            <span>Expertise</span>
            <input value={draftProfile.expertise?.join(", ") || ""} onChange={(event) => setDraftProfile((current) => ({ ...current, expertise: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))} style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px", background: "var(--surface-secondary)" }} />
          </label>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: 600, color: "var(--text-primary)" }}>
          <span>Bio</span>
          <textarea value={draftProfile.bio || ""} onChange={(event) => setDraftProfile((current) => ({ ...current, bio: event.target.value }))} rows={5} style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px", background: "var(--surface-secondary)", resize: "vertical" }} />
        </label>
      </section>

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
          <h3 style={{ marginBottom: "12px" }}>Session pricing & scheduling</h3>
          <p style={{ margin: "0 0 16px", color: "var(--text-secondary)" }}>
            Select the session types you want to offer, choose a price per session, and set the date and time for each service. You can schedule sessions up to a week from today.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
            {serviceOptions.map((option) => {
              const selected = services.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleServiceToggle(option)}
                  style={{
                    border: `1px solid ${selected ? "var(--primary)" : "var(--border)"}`,
                    background: selected ? "rgba(106, 68, 48, 0.12)" : "var(--surface)",
                    color: selected ? "var(--primary)" : "var(--text-primary)",
                    borderRadius: "999px",
                    padding: "10px 16px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {selected ? "✓ " : "○ "}{option}
                </button>
              );
            })}
          </div>

          {services.length === 0 ? (
            <div style={{ padding: "18px", border: "1px dashed var(--border)", borderRadius: "20px", background: "var(--surface-secondary)", color: "var(--text-secondary)" }}>
              Choose a session type above to set pricing and timing.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "20px" }}>
              {services.map((service) => {
                const details = sessionDetails[service] || { date: "", startTime: "10:00", duration: 30, endTime: "10:30" };
                return (
                  <div key={service} style={{ border: "1px solid var(--border)", borderRadius: "24px", padding: "20px", background: "var(--surface)", boxShadow: "0 10px 30px rgba(81, 59, 34, 0.05)" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "16px", alignItems: "center" }}>
                      <h4 style={{ margin: 0, fontSize: "1.05rem" }}>{service}</h4>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Price per session</span>
                    </div>
                    <div style={{ display: "grid", gap: "14px", marginTop: "16px" }}>
                      <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "1fr 1fr", minWidth: 0 }}>
                        <label style={{ display: "grid", gap: "8px", fontWeight: 600, color: "var(--text-primary)" }}>
                          <span>Price</span>
                          <select
                            value={pricing[service] || "Free"}
                            onChange={(event) => handlePricingChange(service, event.target.value)}
                            disabled={isGroupSession(service)}
                            style={{
                              border: "1px solid var(--border)",
                              borderRadius: "12px",
                              padding: "14px 16px",
                              background: isGroupSession(service) ? "#f5f0ea" : "white",
                              fontSize: "1.05rem",
                              minWidth: "180px",
                              color: isGroupSession(service) ? "var(--text-secondary)" : "inherit",
                            }}
                          >
                            {priceOptions.map((option) => (
                              <option key={option} value={option} style={{ fontSize: "1.05rem" }}>
                                {option}
                              </option>
                            ))}
                          </select>
                          {isGroupSession(service) ? (
                            <span style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                              Group sessions are free.
                            </span>
                          ) : null}
                        </label>
                        <label style={{ display: "grid", gap: "8px", fontWeight: 600, color: "var(--text-primary)" }}>
                          <span>Select a day this week</span>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "8px" }}>
                            {weekDates.map((date) => {
                              const value = date.toISOString().slice(0, 10);
                              const selected = details.date === value;
                              return (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => handleSelectWeekDate(service, value)}
                                  style={{
                                    border: `1px solid ${selected ? "var(--primary)" : "var(--border)"}`,
                                    background: selected ? "rgba(106, 68, 48, 0.12)" : "white",
                                    color: selected ? "var(--primary)" : "var(--text-primary)",
                                    borderRadius: "16px",
                                    padding: "14px 10px",
                                    cursor: "pointer",
                                    minHeight: "70px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.92rem",
                                  }}
                                >
                                  <span style={{ fontWeight: 700 }}>{formatWeekLabel(date).split(" ")[0]}</span>
                                  <span>{date.getDate()}</span>
                                </button>
                              );
                            })}
                          </div>
                        </label>
                      </div>
                      <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "1fr 1fr", minWidth: 0 }}>
                        <label style={{ display: "grid", gap: "8px", fontWeight: 600, color: "var(--text-primary)" }}>
                          <span>Duration</span>
                          <select value={details.duration} onChange={(event) => handleSessionDurationChange(service, Number(event.target.value))} style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px", background: "white" }}>
                            {durationOptions.map((value) => (
                              <option key={value} value={value}>{`${value} minutes`}</option>
                            ))}
                          </select>
                        </label>
                        <label style={{ display: "grid", gap: "8px", fontWeight: 600, color: "var(--text-primary)" }}>
                          <span>Start time</span>
                          <input type="time" value={details.startTime} onChange={(event) => handleSessionStartTimeChange(service, event.target.value)} style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px", background: "white" }} />
                        </label>
                      </div>
                      <div style={{ display: "grid", gap: "8px", gridTemplateColumns: "1fr", minWidth: 0 }}>
                        <label style={{ display: "grid", gap: "8px", fontWeight: 600, color: "var(--text-primary)" }}>
                          <span>End time</span>
                          <input type="time" value={details.endTime} readOnly style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px", background: "#f7f2ec" }} />
                        </label>
                      </div>
                      <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem" }}>This price is for one session.</p>
                    </div>
                    <div style={{ marginTop: "18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>Added schedule slots</p>
                        <button type="button" onClick={() => handleAddSessionSlot(service)} style={{ border: "1px solid var(--primary)", background: "var(--primary)", color: "white", borderRadius: "999px", padding: "8px 16px", cursor: "pointer" }}>
                          Add slot
                        </button>
                      </div>
                      <div style={{ display: "grid", gap: "10px" }}>
                        {(sessionSlots[service] || []).map((slot) => (
                          <div key={slot.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "16px", background: "var(--surface-secondary)" }}>
                            <div style={{ display: "grid", gap: "4px" }}>
                              <span style={{ fontWeight: 700 }}>{formatWeekLabel(new Date(slot.date))}</span>
                              <span style={{ color: "var(--text-secondary)" }}>{slot.startTime} - {slot.endTime} • {slot.duration} min</span>
                            </div>
                            <button type="button" onClick={() => handleRemoveSessionSlot(service, slot.id)} style={{ border: "none", background: "transparent", color: "var(--primary)", fontSize: "1.25rem", cursor: "pointer" }}>
                              ×
                            </button>
                          </div>
                        ))}
                        {(sessionSlots[service] || []).length === 0 ? (
                          <div style={{ color: "var(--text-secondary)", padding: "12px 14px", border: "1px dashed var(--border)", borderRadius: "16px", background: "var(--surface-secondary)" }}>
                            Add one or more days and times for this service. Slots appear here and can be edited later.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "18px" }}>
            <button
              type="button"
              onClick={() => handleSaveBookingSchedule()}
              style={{
                border: "1px solid var(--primary)",
                background: "var(--primary)",
                color: "white",
                borderRadius: "999px",
                padding: "12px 20px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Save booking schedule
            </button>
          </div>

          {showUpiField ? (
            <div style={{ border: "1px solid var(--border)", borderRadius: "24px", padding: "20px", background: "var(--surface)", boxShadow: "0 10px 30px rgba(81, 59, 34, 0.05)", marginTop: "24px" }}>
              <h4 style={{ margin: "0 0 12px", fontSize: "1rem" }}>Payment details</h4>
              <p style={{ margin: "0 0 16px", color: "var(--text-secondary)" }}>Students will pay the selected price per session. Add your UPI ID so payments can be received.</p>
              <label style={{ display: "grid", gap: "8px", fontWeight: 600, color: "var(--text-primary)", maxWidth: "380px" }}>
                <span>UPI ID</span>
                <input value={payoutDetails.upiId} onChange={(event) => setPayoutDetails((current) => ({ ...current, upiId: event.target.value }))} placeholder="rahul@oksbi" style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "12px 14px", background: "white" }} />
              </label>
            </div>
          ) : null}
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
