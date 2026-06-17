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
        <h1
          style={{
            marginBottom: "16px",
          }}
        >
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
            src={
              user.profileImage ||
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80"
            }
            alt={user.name}
            width={120}
            height={120}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              border: "4px solid var(--surface-secondary)",
            }}
          />

          <div>
            <h1
              style={{
                marginBottom: "8px",
              }}
            >
              {user.name}
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
                background:
                  "var(--surface-secondary)",
                padding: "8px 14px",
                borderRadius: "999px",
                textTransform: "capitalize",
              }}
            >
              {user.role}
            </span>
          </div>
        </div>

        {user.role === "student" && (
          <StudentSection />
        )}

        {user.role === "alumni" && (
          <AlumniSection />
        )}
      </section>
    </main>
  );
}

function StudentSection() {
  const profile =
    typeof window !== "undefined"
      ? JSON.parse(
          localStorage.getItem(
            "student-profile"
          ) || "{}"
        )
      : {};

  const hasProfile =
    Object.keys(profile).length > 0;

  if (!hasProfile) {
    return (
      <div>
        <h2
          style={{
            marginBottom: "16px",
          }}
        >
          Complete your profile
        </h2>

        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "24px",
          }}
        >
          Tell us about your goals so we can
          recommend relevant alumni.
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
        value={profile.department}
      />

      <InfoCard
        label="Graduation Year"
        value={profile.graduationYear}
      />

      <InfoCard
        label="Target Companies"
        value={
          profile.targetCompanies?.join(", ") ||
          "Not specified"
        }
      />

      <InfoCard
        label="Desired Roles"
        value={
          profile.desiredRoles?.join(", ") ||
          "Not specified"
        }
      />
    </div>
  );
}

function AlumniSection() {
  const profile =
    typeof window !== "undefined"
      ? JSON.parse(
          localStorage.getItem(
            "alumni-profile"
          ) || "{}"
        )
      : {};

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
        value={profile.company}
      />

      <InfoCard
        label="Role"
        value={profile.role}
      />

      <InfoCard
        label="Graduation Year"
        value={profile.graduationYear}
      />

      <InfoCard
        label="Verification"
        value={
          profile.verificationStatus ||
          "Pending"
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
  value: string;
}) {
  return (
    <div
      style={{
        background: "var(--background)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "20px",
      }}
    >
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "14px",
          marginBottom: "8px",
        }}
      >
        {label}
      </p>

      <p>{value || "Not specified"}</p>
    </div>
  );
}