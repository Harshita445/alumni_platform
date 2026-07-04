"use client";

import Link from "next/link";
import type React from "react";

import AccessGateCard from "@/components/AccessGateCard";
import AlumniCard from "@/components/AlumniCard";
import { useAuth } from "@/hooks/useAuth";
import { useSavedAlumni } from "@/hooks/useSavedAlumni";
import { UserRound } from "lucide-react";

export default function SavedPage() {
  const { user } = useAuth();
  const { savedAlumni, loading, error } = useSavedAlumni();

  return (
    <main
      style={{
        maxWidth: "var(--container-width)",
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
        Saved Alumni
      </h1>

      {!user ? (
        <AccessGateCard
          icon={UserRound}
          title="Login to view saved alumni"
          description="Your saved mentors are tied to your student account."
          bullets={[
            "Keep mentors handy",
            "Revisit conversations later",
            "Stay connected to your shortlist",
          ]}
          buttonLabel="Go to Login"
          href="/login"
        />
      ) : user.role !== "student" ? (
        <EmptyPanel
          title="Saved alumni is for students"
          message="Alumni accounts do not maintain a saved mentor list."
        />
      ) : loading ? (
        <div
          style={{
            padding: "24px",
            color: "var(--text-secondary)",
          }}
        >
          Loading saved alumni...
        </div>
      ) : error ? (
        <EmptyPanel
          title="Could not load saved alumni"
          message={error}
          tone="danger"
        />
      ) : savedAlumni.length === 0 ? (
        <EmptyPanel
          title="No saved alumni yet"
          message="Save mentors to revisit them later."
        />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {savedAlumni.map((alumni) => (
            <AlumniCard
              key={alumni.id}
              id={alumni.id}
              name={alumni.full_name ?? "Unknown"}
              profileImage={alumni.profile_image ?? "/default-avatar.png"}
              company={alumni.company ?? "Independent"}
              role={alumni.designation ?? "Alumni"}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function EmptyPanel({
  title,
  message,
  tone,
  children,
}: {
  title: string;
  message: string | null;
  tone?: "danger";
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "48px",
        textAlign: "center",
        color: tone === "danger" ? "var(--danger)" : undefined,
      }}
    >
      <h3
        style={{
          marginBottom: "12px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "var(--text-secondary)",
          marginBottom: children ? "24px" : 0,
        }}
      >
        {message}
      </p>

      {children}
    </div>
  );
}

const primaryLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--primary)",
  color: "#fff",
  padding: "12px 18px",
  borderRadius: "var(--radius-md)",
  textDecoration: "none",
  minHeight: "44px",
  fontWeight: 500,
};
