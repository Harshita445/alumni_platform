import Link from "next/link";

import { mockAlumni } from "@/data/mockAlumni";
import { mockReviews } from "@/data/mockReviews";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const alumni = mockAlumni.find(
    (person) => person.id === id
  );

  const reviews = mockReviews.filter(
    (review) => review.alumniId === id
  );

  if (!alumni) {
    return <h1>Alumni not found</h1>;
  }

  return (
    <main
      style={{
        maxWidth: "900px",
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
          marginBottom: "32px",
        }}
      >
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
            marginBottom: "20px",
          }}
        >
          {alumni.role} · {alumni.company}
        </p>

        <p
          style={{
            lineHeight: 1.7,
            marginBottom: "32px",
          }}
        >
          {alumni.bio}
        </p>

        <h3
          style={{
            marginBottom: "16px",
          }}
        >
          Session Types
        </h3>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          {alumni.sessionTypes.map((session) => (
            <span
              key={session}
              style={{
                padding: "10px 14px",
                borderRadius: "999px",
                background:
                  "var(--surface-secondary)",
              }}
            >
              {session}
            </span>
          ))}
        </div>

        <Link
          href={`/bookings?alumniId=${alumni.id}`}
          style={{
            display: "inline-block",
            background: "var(--primary)",
            color: "white",
            padding: "14px 22px",
            borderRadius: "var(--radius-md)",
          }}
        >
          Book a Session
        </Link>
      </div>

      <section>
        <h2
          style={{
            marginBottom: "24px",
          }}
        >
          Reviews
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "24px",
              }}
            >
              <h4
                style={{
                  marginBottom: "10px",
                }}
              >
                {review.studentName}
              </h4>

              <p
                style={{
                  marginBottom: "12px",
                }}
              >
                {"⭐".repeat(review.rating)}
              </p>

              <p
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}