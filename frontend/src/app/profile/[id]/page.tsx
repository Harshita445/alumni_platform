import Image from "next/image";
import { notFound } from "next/navigation";

import { mockAlumni } from "@/data/mockAlumni";

type ProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProfilePage({
  params,
}: ProfilePageProps) {
  const { id } = await params;

  const alumni = mockAlumni.find(
    (person) => person.id === id
  );

  if (!alumni) {
    notFound();
  }

  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "48px 24px 80px",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "40px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <Image
          src={alumni.profileImage}
          alt={alumni.name}
          width={120}
          height={120}
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: "24px",
          }}
        />

        <h1
          style={{
            marginBottom: "12px",
          }}
        >
          {alumni.name}
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "8px",
          }}
        >
          {alumni.role} · {alumni.company}
        </p>

        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "32px",
          }}
        >
          Class of {alumni.graduationYear}
        </p>

        <p
          style={{
            lineHeight: 1.8,
            marginBottom: "32px",
          }}
        >
          {alumni.bio}
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "32px",
          }}
        >
          {alumni.sessionTypes.map((session) => (
            <span
              key={session}
              style={{
                padding: "8px 14px",
                borderRadius: "999px",
                background:
                  "var(--surface-secondary)",
                fontSize: "14px",
              }}
            >
              {session}
            </span>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                color: "var(--text-secondary)",
                marginBottom: "4px",
              }}
            >
              Rating
            </p>

            <strong>{alumni.rating} / 5</strong>
          </div>

          <div>
            <p
              style={{
                color: "var(--text-secondary)",
                marginBottom: "4px",
              }}
            >
              Reviews
            </p>

            <strong>{alumni.totalReviews}</strong>
          </div>

          <div>
            <p
              style={{
                color: "var(--text-secondary)",
                marginBottom: "4px",
              }}
            >
              Session Fee
            </p>

            <strong>₹{alumni.hourlyRate}</strong>
          </div>
        </div>
      </div>
    </main>
  );
}