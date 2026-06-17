"use client";

import AlumniCard from "@/components/AlumniCard";
import { mockAlumni } from "@/data/mockAlumni";
import { useSavedAlumni } from "@/hooks/useSavedAlumni";

export default function SavedPage() {
  const { savedIds } = useSavedAlumni();

  const savedAlumni = mockAlumni.filter((alumni) =>
    savedIds.includes(alumni.id)
  );

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

      {savedAlumni.length === 0 ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "48px",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              marginBottom: "12px",
            }}
          >
            No saved alumni yet
          </h3>

          <p
            style={{
              color: "var(--text-secondary)",
            }}
          >
            Save mentors to revisit them later.
          </p>
        </div>
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
              name={alumni.name}
              profileImage={alumni.profileImage}
              company={alumni.company}
              role={alumni.role}
            />
          ))}
        </div>
      )}
    </main>
  );
}