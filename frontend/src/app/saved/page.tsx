"use client";

import AlumniCard from "@/components/AlumniCard";
import EmptyState from "@/components/EmptyState";
import { mockAlumni } from "@/data/mockAlumni";
import { useSavedAlumni } from "@/hooks/useSavedAlumni";

export default function SavedPage() {
  const { savedIds } = useSavedAlumni();

  const savedAlumni = mockAlumni.filter(
    (alumni) => savedIds.includes(alumni.id)
  );

  if (savedAlumni.length === 0) {
    return (
      <EmptyState
        title="No saved alumni"
        description="Save mentors to access them quickly later."
      />
    );
  }

  return (
    <main
      style={{
        maxWidth: "var(--container-width)",
        margin: "0 auto",
        padding: "48px 24px",
      }}
    >
      <h1
        style={{
          marginBottom: "32px",
        }}
      >
        Saved Alumni
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
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
    </main>
  );
}