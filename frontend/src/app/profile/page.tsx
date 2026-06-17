"use client";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";

export default function MyProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <main
        style={{
          maxWidth: "600px",
          margin: "80px auto",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "16px" }}>
          Please log in
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "24px",
          }}
        >
          Sign in to access your profile.
        </p>
        <Link
          href="/login"
          style={{
            display: "inline-block",
            background: "var(--primary)",
            color: "#fff",
            padding: "14px 24px",
            borderRadius: "var(--radius-md)",
          }}
        >
          Go to Login
        </Link>
      </main>
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

type ProfileData = {
  branch?: string;
  graduation_year?: number;
  target_companies?: string[];
  desired_roles?: string[];
  company?: string;
  designation?: string;
  linkedin_url?: string;
};

function StudentSection({ profile }: { profile: ProfileData }) {
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

function AlumniSection({ profile }: { profile: ProfileData }) {
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
        label="Company"
        value={profile.company || "Not specified"}
      />
      <InfoCard
        label="Designation"
        value={profile.designation || "Not specified"}
      />
      <InfoCard
        label="Graduation Year"
        value={profile.graduation_year || "Not specified"}
      />
      <InfoCard
        label="LinkedIn"
        value={
          profile.linkedin_url ? (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--primary)" }}
            >
              View profile
            </a>
          ) : (
            "Not specified"
          )
        }
      />
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
