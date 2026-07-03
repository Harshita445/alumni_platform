"use client";

import Image from "next/image";
import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";
import { useSavedAlumni } from "@/hooks/useSavedAlumni";

type Props = {
  id: number;
  name: string;
  profileImage: string;
  company: string;
  role: string;
};

export default function AlumniCard({
  id,
  name,
  profileImage,
  company,
  role,
}: Props) {
  const { user } = useAuth();
  const { toggleSave, isSaved, canSave } = useSavedAlumni();
  const saved = isSaved(id);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        flexWrap: "wrap",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          flex: 1,
          minWidth: "260px",
        }}
      >
        <Image
          src={profileImage}
          alt={name}
          width={72}
          height={72}
          style={{
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />

        <div>
          <h3
            style={{
              marginBottom: "6px",
            }}
          >
            {name}
          </h3>

          <p
            style={{
              color: "var(--text-secondary)",
            }}
          >
            {role} - {company}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {canSave ? (
          <button
            onClick={() => toggleSave(id)}
            aria-pressed={saved}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              cursor: "pointer",
              minHeight: "44px",
              fontSize: "15px",
              color: saved
                ? "var(--accent)"
                : "var(--text-secondary)",
              transition: "0.2s ease",
            }}
          >
            {saved ? "Saved" : "Save"}
          </button>
        ) : null}

        {!user ? (
          <Link
            href="/login"
            style={{
              background: "var(--surface)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "12px 18px",
              textDecoration: "none",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 500,
            }}
          >
            Log in to book a session
          </Link>
        ) : null}

        <Link
          href={`/profile/${id}`}
          style={{
            background: "var(--primary)",
            color: "#FFFFFF",
            padding: "12px 18px",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            minHeight: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 500,
          }}
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
